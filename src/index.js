
import { addAnimationEventListeners, cacheDomElement, dom, getBlockTime, getGroupOffsetTimes, getTransformWrapElement, resetDomElements } from './helpers.js';

function AnimationBlock(block, config) {
  this.block = block;
  this.config = config;
  this.init = function(globalOffsetTime) {
    globalOffsetTime = typeof globalOffsetTime !== 'undefined' ? globalOffsetTime : 0;

    return this.processedBlock(globalOffsetTime);
  }
  this.processedBlock = function(globalOffsetTime) {
    let blockTimes = {};
    const {
      defaults: {
        elementSelector: defaultElementSelector = false,
        groupOffset: defaultGroupOffset = false,
      }
    } = this.config;;

    for ( const timeString in this.block ) {
      const blockTime = getBlockTime(timeString, globalOffsetTime);

      if ( blockTime >= 0 ) {
        const { animations, blocks: importedBlocks } = block[timeString];

        // console.log(block[timeString]);

        if ( !blockTimes[blockTime] ) {
          blockTimes[blockTime] = {};
        }

        /* Add current block's animations */
        if ( animations ) {
          animations.map((animation) => {
            const { elementSelector, groupOffset } = animation;

            console.log({animation});
            if ( !elementSelector && defaultElementSelector ) {
              animation.elementSelector = defaultElementSelector;
            }

            if ( !groupOffset && defaultGroupOffset ) {
              animation.groupOffset = defaultGroupOffset;
            }

            return animation;
          });
          // if ( !blockTimes[blockTime].elementSelector && defaultElementSelector ) {
          //   blockTimes[blockTime].elementSelector = defaultElementSelector;
          // }

          blockTimes[blockTime].animations
            ? blockTimes[blockTime].animations.push(...animations)
            :  blockTimes[blockTime].animations = animations;
        }

        /* Add included blocks' animations */
        if ( importedBlocks ) {
          importedBlocks.forEach((importedBlock) => {
            const importedBlockTimes = importedBlock.init(blockTime);
            // const { config = {} } = importedBlock
            // const { defaults = {} } = config;
            // const {
            //   elementSelector: defaultElementSelector = false,
            //   groupOffset: defaultGroupOffset = false,
            // } = defaults;

            // console.log({defaults});
            console.log({defaultElementSelector});

            if ( importedBlockTimes ) {
              for ( let [time, block] of Object.entries(importedBlockTimes) ) {
                if ( !blockTimes[time] ) {
                  blockTimes[time] = {};
                }

                if ( !blockTimes[time].animations ) {
                  blockTimes[time].animations = [];
                }

                // blockTimes[time].animations.map((animation) => {
                //   const { elementSelector = false } = animation;
                //
                //   console.log({animation});
                //   console.log({elementSelector});
                //   console.log({defaultElementSelector});
                //
                //   if ( !elementSelector && defaultElementSelector ) {
                //     // console.log('defaultElementSelector');
                //     // animation.elementSelector = defaultElementSelector;
                //   }
                //
                //   return animation;
                // });

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
  const { globalOffsetTime = 0, loop = false, defaults = {} } = this.config;
  const block = this.init();
  const elementTransformKeys = this.elementTransformKeys(block);
  const animationTimes = Object.keys(block);
  const lastAnimationIndex = animationTimes.length - 1;
  let nextAnimationIndex = 0;
  let startTime;

  console.log({block});
  console.log({defaults: defaults.elementSelector});

  requestAnimationFrame(animation);

  function animation(timestamp) {
    if (!startTime) startTime = timestamp;

    if ( timestamp - startTime >= animationTimes[nextAnimationIndex] ) {
      const { animations } = block[animationTimes[nextAnimationIndex]];

      if ( !animations ) return false;

      animations.forEach((animation, index) => {
        const { elementSelector, cssAnimation, cssTransform, groupOffset } = animation;
        const currentElementSelector = elementSelector ? elementSelector : defaults.elementSelector;

        if ( !currentElementSelector ) return false;
        if ( (!cssAnimation || !Array.isArray(cssAnimation)) && (!cssTransform || typeof cssTransform !== 'object') ) return false;
        if ( !dom[currentElementSelector] ) cacheDomElement(currentElementSelector, elementTransformKeys[currentElementSelector].size);

        dom[currentElementSelector].elements.forEach((element, index) => {
          const offsetDelayTime = getGroupOffsetTimes(groupOffset);
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

      nextAnimationIndex++;
    }

    if ( nextAnimationIndex <= lastAnimationIndex ) {
      requestAnimationFrame(animation);
    } else if ( loop ) {
      startTime = timestamp;
      nextAnimationIndex = 0;
      resetDomElements(dom);
      requestAnimationFrame(animation);
    }
  }
}

export { AnimationBlock };
