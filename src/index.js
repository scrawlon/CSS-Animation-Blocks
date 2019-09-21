
import { createTransformWrappers, getBlockTime, getGroupOffsetTimes, getKeyframeProps, getRandomInt, getRemainingAnimations } from './helpers.js';

function AnimationBlock(block, config) {
  this.block = block;
  this.config = config;
  this.init = function(globalOffsetTime) {
    globalOffsetTime = typeof globalOffsetTime !== 'undefined' ? globalOffsetTime : 0;

    return this.processedBlock(globalOffsetTime);
  }
  this.processedBlock = function(globalOffsetTime) {
    let blockTimes = {};
    let elementTransformKeys = this.elementTransformKeys;

    for ( const timeString in this.block ) {
      const blockTime = getBlockTime(timeString, globalOffsetTime);

      if ( blockTime ) {
        const { animations, blocks: importedBlocks } = block[timeString];

        if ( !blockTimes[blockTime] ) {
          blockTimes[blockTime] = {};
        }

        /* Add current block's animations */
        if ( animations ) {
          blockTimes[blockTime].animations
            ? blockTimes[blockTime].animations.push(...animations)
            :  blockTimes[blockTime].animations = animations;
        }

        /* Add included blocks' animations */
        if ( importedBlocks ) {
          importedBlocks.forEach((importedBlock) => {
            const importedBlockTimes = importedBlock.init(blockTime);

            if ( importedBlockTimes ) {
              for ( let [time, block] of Object.entries(importedBlockTimes) ) {
                if ( !blockTimes[time] ) {
                  blockTimes[time] = {};
                }

                if ( !blockTimes[time].animations ) {
                  blockTimes[time].animations = [];
                }

                blockTimes[time].animations.push(...block.animations);
              }
            }
          });
        }
      } else {
        console.log(`Invalid time: ${timeString}`);
      }
    }

    return blockTimes;
  };
  this.elementTransformKeys = function(block) {
    const blockTimes = Object.keys(block);
    let transformKeys = {};

    blockTimes.forEach((blockTime) => {
      const { animations } = block[blockTime];

      if ( animations ) {
        animations.forEach((animation) => {
          const { elementSelector, transformCSS } = animation;

          if ( !transformKeys[elementSelector] ) {
            transformKeys[elementSelector] = new Set();
          }

          if ( transformCSS && typeof transformCSS === 'object' ) {
            Object.keys(transformCSS).forEach((key) => {
              if ( key !== 'rotate' ) transformKeys[elementSelector].add(key);
            });
          }
        });
      }
    });

    return transformKeys;
  };
}

function getTransformWrapElement(element, transformType, transformCount) {
  let currentElement = element;
  let count = 0;
  let firstAvailable = false;

  while ( count < transformCount ) {
    const parent = currentElement.parentElement;

    if ( parent.classList.contains('transform-wrapper') ) {
      currentElement = parent;
    }

    if ( parent.dataset.transform === transformType ) return parent;
    if ( !firstAvailable && !parent.dataset.transform ) firstAvailable = currentElement;

    count++;
  }

  if ( firstAvailable ) {
    firstAvailable.dataset.transform = transformType;
    return firstAvailable;
  }

  return currentElement;
}

AnimationBlock.prototype.start = function() {
  const { globalOffsetTime = 0, loop = false } = this.config;
  const block = this.init();
  const elementTransformKeys = this.elementTransformKeys(block);
  const animationTimes = Object.keys(block);
  const lastAnimationIndex = animationTimes.length - 1;
  const styleSheets = document.styleSheets;
  let nextAnimationIndex = 0;
  let startTime;
  let dom = {};

  console.log(block);
  console.log(elementTransformKeys);
  // console.log({config: this.config});

  requestAnimationFrame(animation);

  function animation(timestamp) {
    if (!startTime) startTime = timestamp;

    if ( timestamp - startTime >= animationTimes[nextAnimationIndex] ) {
      const { animations } = block[animationTimes[nextAnimationIndex]];

      if ( !animations ) return false;

      animations.forEach((animation) => {
        const { elementSelector, animationCSS, transformCSS, groupOffset } = animation;

        if ( !elementSelector ) return false;
        if ( (!animationCSS || !Array.isArray(animationCSS)) && (!transformCSS || typeof transformCSS !== 'object') ) return false;
        if ( !dom[elementSelector] ) cacheDomElement(elementSelector, elementTransformKeys[elementSelector].size);

        dom[elementSelector].elements.forEach((element, index) => {
          const offsetDelayTime = getGroupOffsetTimes(groupOffset);

          setTimeout(() => {
            const runningAnimations = element.style.animation ? element.style.animation.split(',') : [];
            const currentAnimations = animationCSS ? animationCSS : [];
            const transformTypes = transformCSS ? Object.keys(transformCSS) : false;
            let rotateAnimation = false;
            let combinedAnimations = runningAnimations.concat(currentAnimations);
            let currentKeyframeProps = {};

            if ( transformTypes ) {
              transformTypes.forEach((transformType) => {
                if ( transformType === 'rotate' ) {
                  rotateAnimation = transformCSS[transformType];
                  combinedAnimations.push(rotateAnimation);
                } else {
                  var currentElement = getTransformWrapElement(element, transformType, elementTransformKeys[elementSelector].size);

                  currentElement.style.animation = transformCSS[transformType];
                  addAnimationEventListeners(currentElement);
                }
              });
            }

            element.style.animation = combinedAnimations.join(',');

            addAnimationEventListeners(element);

            function addAnimationEventListeners(element) {
              element.addEventListener('animationstart', (event) => {
                const { animationName } = event;
                // console.log({animationName});

                /* Keep track of CSS properties of current animation's keyframes */
                if ( !currentKeyframeProps[animationName] ) {
                  currentKeyframeProps[animationName] = getKeyframeProps(styleSheets, animationName);
                }

                /* remove inline styles associated that might override current animation */
                currentKeyframeProps[animationName].forEach((style) => {
                  if ( style !== 'transform' ) element.style.removeProperty(style);
                });
              });

              element.addEventListener('animationend', (event) => {
                const { animationName } = event;
                const endStyles = getComputedStyle(element);
                const remainingAnimations = getRemainingAnimations(element, animationName);

                if ( !currentKeyframeProps[animationName] ) {
                  currentKeyframeProps[animationName] = getKeyframeProps(styleSheets, animationName);
                }

                /* Hold animated CSS property values after animation is removed from element */
                currentKeyframeProps[animationName].forEach((style) => {
                  element.style[style] = endStyles.getPropertyValue(style);
                });

                if ( remainingAnimations ) element.style.animation = remainingAnimations;
              });
            }

          }, offsetDelayTime * index);

        });
      });

      nextAnimationIndex++;
    }

    if ( nextAnimationIndex <= lastAnimationIndex ) {
      requestAnimationFrame(animation);
    } else if ( loop ) {
      /* loop code goes here */
      // startTime = timestamp;
      // nextAnimationIndex = 0;
      // dom = {};
      // requestAnimationFrame(animation);
    }
  }

  function cacheDomElement(elementSelector, transformCount) {
    const elements = document.querySelectorAll(elementSelector)

    dom[elementSelector] = {
      elements: elements,
      transformWrapLevel: Array(elements.length).fill(0)
    };

    createTransformWrappers(elementSelector, transformCount);
  }
}

export { AnimationBlock };
