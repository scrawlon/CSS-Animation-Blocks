
import {
  addAnimationEventListeners,
  cacheDomElement,
  dom,
  getBlockTime,
  getGroupOffsetValue,
  getTransformWrapElement,
  resetDomElements
} from './helpers.js';

function AnimationBlock(block = {}, config = {}) {
  this.block = block;
  this.config = config;
  this.init = function(globalOffsetTime, outerLoopEndTime = 0) {
    globalOffsetTime = typeof globalOffsetTime !== 'undefined' ? globalOffsetTime : 0;

    return this.processedBlock(globalOffsetTime, outerLoopEndTime);
  }
  this.processedBlock = function(globalOffsetTime, outerLoopEndTime) {
    const { defaults = {} } = this.config;
    const {
      elementSelector: defaultElementSelector = false,
      groupOffset: defaultGroupOffset = false,
    } = defaults;
    let blockTimes = {};
    const outerLoopEndBlockTime = outerLoopEndTime ? getBlockTime(outerLoopEndTime) : 0;

    if ( globalOffsetTime === 0 && outerLoopEndTime ) {
      if ( !blockTimes[outerLoopEndBlockTime] ) blockTimes[outerLoopEndBlockTime] = {};
      if ( !blockTimes[outerLoopEndBlockTime].loopEnd ) blockTimes[outerLoopEndBlockTime].loopEnd = true;
    }

    console.log({outerLoopEndTime});

    for ( const timeString in this.block ) {
      const blockTime = getBlockTime(timeString, globalOffsetTime);

      if ( blockTime >= 0 ) {
        const { animations = [], blocks: importedBlocks = [] } = block[timeString];

        if ( !blockTimes[blockTime] ) {
          blockTimes[blockTime] = {};
        }

        /* Add current block's animations */
        animations.map((animation) => {
          const { elementSelector, groupOffset } = animation;

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

        // blockTimes[blockTime].loopEnd = loopEnd;

        /* Add included blocks' animations */
        importedBlocks.forEach((importedBlock) => {
          const importedBlockTimes = importedBlock.init(blockTime, outerLoopEndTime);
          const { loop = {}, defaults = {} } = importedBlock.config;
          const { count = 1, infinite: loopInfinite = false, endTime: configLoopEndTime = false } = loop;
          const importedConfigLoopEndTime = configLoopEndTime ? getBlockTime(configLoopEndTime) + blockTime : false;
          // let loopCount = 0;
          let loopDuration = importedConfigLoopEndTime ? importedConfigLoopEndTime - blockTime : 0;
          const maxLoopCount = getMaxLoopCount(count, loopDuration, importedConfigLoopEndTime, outerLoopEndBlockTime);

          function getMaxLoopCount(loopCount, loopDuration, loopEndTime, outerLoopEndTime) {
            if ( !loopCount || !loopDuration || !loopEndTime || !outerLoopEndTime ) return 1;
            /* reminder -- handle loopInfinite */

            let maxLoopCount = 1;

            while ( maxLoopCount < loopCount && (loopEndTime + (loopDuration * maxLoopCount)) <= outerLoopEndTime ) {
              maxLoopCount++;
            }

            console.log({maxLoopCount, loopCount, loopDuration, loopEndTime, outerLoopEndTime});

            return maxLoopCount;
          }

          console.log({count, importedConfigLoopEndTime, loopDuration});
          // console.log({importedBlockTimes});

          if ( importedBlockTimes ) {
            insertImportedAnimations(importedBlockTimes);
          }

          function insertImportedAnimations(importedBlockTimes) {
            for ( let [time, block] of Object.entries(importedBlockTimes) ) {
              if ( !blockTimes[time] ) {
                blockTimes[time] = {};
              }

              if ( !blockTimes[time].animations ) {
                blockTimes[time].animations = [];
              }

              if ( block.animations ) {
                blockTimes[time].animations.push(...block.animations);
              }
            }
          }

          /* repeat blocks that are looped */
          if ( configLoopEndTime && maxLoopCount > 1 ) {
            [...Array(maxLoopCount).keys()].forEach((loopCount) => {
              const importedBlockLoopInsertTime = importedConfigLoopEndTime + (loopDuration * loopCount);
              const importedBlockTimes = importedBlock.init(importedBlockLoopInsertTime, outerLoopEndTime);

              if ( loopCount && importedConfigLoopEndTime ) {
                console.log({loopCount, importedBlockLoopInsertTime});
                insertImportedAnimations(importedBlockTimes);
              }
            });
          }
        });
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
  const { count = 1, infinite: loopInfinite = false, endTime: configLoopEnd = false } = loop;
  const {
    elementSelector: defaultElementSelector = false,
    groupOffset: defaultGroupOffset = false,
  } = defaults;
  const block = this.init(0, configLoopEnd);
  const elementTransformKeys = this.elementTransformKeys(block);
  const animationTimes = Object.keys(block);
  const lastAnimationIndex = animationTimes.length - 1;
  let nextAnimationIndex = 0;
  let startTime;
  let restartLoop = false;
  let loopCount = count;

  console.log({loopCount, loopInfinite});

  console.log({block});
  // console.log({defaultElementSelector});
  // console.log({defaultGroupOffset});

  requestAnimationFrame(animation);

  function animation(timestamp) {
    if (!startTime) startTime = timestamp;

    if ( timestamp - startTime >= animationTimes[nextAnimationIndex] ) {
      const { animations = [], loopEnd = false } = block[animationTimes[nextAnimationIndex]];

      animations.forEach((animation, index) => {
        const { elementSelector, cssAnimation, cssTransform, groupOffset } = animation;
        const currentElementSelector = elementSelector ? elementSelector : defaultElementSelector;

        if ( !currentElementSelector ) return false;
        if ( (!cssAnimation || !Array.isArray(cssAnimation)) && (!cssTransform || typeof cssTransform !== 'object') ) return false;
        if ( !dom[currentElementSelector] ) cacheDomElement(currentElementSelector, elementTransformKeys[currentElementSelector].size);

        dom[currentElementSelector].elements.forEach((element, index) => {
          const offsetDelayTime = groupOffset ? getGroupOffsetValue(groupOffset)
            : ( defaultGroupOffset ? getGroupOffsetValue(defaultGroupOffset) : 0 );
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

      if ( loopEnd && (loopCount || loopInfinite) ) restartLoop = true;

      nextAnimationIndex++;
    }

    if ( !restartLoop && nextAnimationIndex <= lastAnimationIndex ) {
      requestAnimationFrame(animation);
    } else if ( restartLoop && loop ) {
      console.log({loop});

      loopCount--;

      if ( loopInfinite || loopCount > 0 ) {
        startTime = timestamp;
        nextAnimationIndex = 0;
        resetDomElements(dom);
        requestAnimationFrame(animation);
      }

      restartLoop = false;
    }
  }
}

export { AnimationBlock };
