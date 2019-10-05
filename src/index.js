
import { addAnimationEventListeners, cacheDomElement, dom, getBlockTime, getDelayRangeRandomOffset, getTransformWrapElement, resetDomElements } from './helpers.js';

function AnimationBlock(block = {}, config = {}) {
  this.block = block;
  this.config = config;
  this.init = function(globalOffsetTime) {
    globalOffsetTime = typeof globalOffsetTime !== 'undefined' ? globalOffsetTime : 0;

    return this.processedBlock(globalOffsetTime);
  }
  this.processedBlock = function(globalOffsetTime) {
    let blockTimes = {};
    const { defaults = {} } = this.config;
    const {
      elementSelector: defaultElementSelector = false,
      groupOffset: defaultGroupOffset = false,
    } = defaults;

    for ( const timeString in this.block ) {
      const blockTime = getBlockTime(timeString, globalOffsetTime);

      if ( blockTime >= 0 ) {
        const { animations, loopEnd = false, blocks: importedBlocks } = block[timeString];

        // console.log('block', block[timeString]);

        if ( !blockTimes[blockTime] ) {
          blockTimes[blockTime] = {};
        }

        /* Add current block's animations */
        if ( animations ) {
          animations.map((animation) => {
            const { elementSelector, groupOffset } = animation;

            // console.log({animation});
            if ( !elementSelector && defaultElementSelector ) {
              animation.elementSelector = defaultElementSelector;
            }

            if ( !groupOffset && defaultGroupOffset ) {
              animation.groupOffset = defaultGroupOffset;
            }

            return animation;
          });

          blockTimes[blockTime].animations
            ? blockTimes[blockTime].animations.push(...animations)
            :  blockTimes[blockTime].animations = animations;
        }

        blockTimes[blockTime].loopEnd = loopEnd;

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

                // console.log('blockTimes',blockTimes[time]);

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
    const { defaults } = config;
    let transformKeys = {};

    blockTimes.forEach((blockTime) => {
      const { animations } = block[blockTime];

      if ( animations ) {
        animations.forEach((animation) => {
          const { elementSelector, cssTransform } = animation;
          const currentElementSelector = elementSelector ? elementSelector : defaults.elementSelector;

          if ( !transformKeys[currentElementSelector] ) {
            transformKeys[currentElementSelector] = new Set();
          }

          if ( cssTransform && typeof cssTransform === 'object' ) {
            Object.keys(cssTransform).forEach((key) => {
              if ( key !== 'rotate' ) transformKeys[currentElementSelector].add(key);
            });
          }
        });
      }
    });

    return transformKeys;
  };
}

AnimationBlock.prototype.start = function() {
  const { globalOffsetTime = 0, loop = {}, defaults = {} } = this.config;
  const {
    elementSelector: defaultElementSelector = false,
    groupOffset: defaultGroupOffset = false,
  } = defaults;
  const block = this.init();
  const elementTransformKeys = this.elementTransformKeys(block);
  const animationTimes = Object.keys(block);
  const lastAnimationIndex = animationTimes.length - 1;
  let nextAnimationIndex = 0;
  let startTime;
  let { count: loopCount = 0, infinite: loopInfinite = false } = loop;
  let restartLoop = false;

  console.log({loopCount, loopInfinite});

  // console.log({block});
  // console.log({defaultElementSelector});
  // console.log({defaultGroupOffset});

  requestAnimationFrame(animation);

  function animation(timestamp) {
    if (!startTime) startTime = timestamp;

    if ( timestamp - startTime >= animationTimes[nextAnimationIndex] ) {
      const { animations = [], loopEnd = false } = block[animationTimes[nextAnimationIndex]];

      // console.log('block', block[animationTimes[nextAnimationIndex]]);

      // if ( !animations ) return false;

      animations.forEach((animation, index) => {
        const { elementSelector, cssAnimation, cssTransform, groupOffset } = animation;
        const currentElementSelector = elementSelector ? elementSelector : defaultElementSelector;

        if ( !currentElementSelector ) return false;
        if ( (!cssAnimation || !Array.isArray(cssAnimation)) && (!cssTransform || typeof cssTransform !== 'object') ) return false;
        if ( !dom[currentElementSelector] ) cacheDomElement(currentElementSelector, elementTransformKeys[currentElementSelector].size);

        dom[currentElementSelector].elements.forEach((element, index) => {
          const offsetDelayTime = groupOffset ? getDelayRangeRandomOffset(groupOffset)
            : ( defaultGroupOffset ? getDelayRangeRandomOffset(defaultGroupOffset) : 0 );
          const runningAnimations = element.style.animation ? element.style.animation.split(',') : [];
          const currentAnimations = cssAnimation ? cssAnimation : [];
          const transformTypes = cssTransform ? Object.keys(cssTransform) : [];
          let rotateAnimation = false;
          let combinedAnimations = runningAnimations.concat(currentAnimations);

          if ( !runningAnimations ) {
            addAnimationEventListeners(element);
          }

          setTimeout(() => {
            transformTypes.forEach((transformType) => {
              if ( transformType === 'rotate' ) {
                rotateAnimation = cssTransform[transformType];
                combinedAnimations.push(rotateAnimation);
              } else {
                const currentElement = getTransformWrapElement(element, transformType, elementTransformKeys[currentElementSelector].size);

                currentElement.style.animation = cssTransform[transformType];
                addAnimationEventListeners(currentElement);
              }
            });

            if ( combinedAnimations ) element.style.animation = combinedAnimations.join(',');
          }, offsetDelayTime * index);

        });
      });

      console.log({loopEnd, time: animationTimes[nextAnimationIndex]});

      if ( loopEnd ) restartLoop = true;

      nextAnimationIndex++;
    }

    if ( !restartLoop && nextAnimationIndex <= lastAnimationIndex ) {
      requestAnimationFrame(animation);
    } else if ( loop ) {
      console.log({loop});

      if ( loopInfinite || loopCount > 0 ) {
        startTime = timestamp;
        nextAnimationIndex = 0;
        resetDomElements(dom);
        requestAnimationFrame(animation);

        loopCount--;
      }

      restartLoop = false;
    }
  }
}

export { AnimationBlock };
