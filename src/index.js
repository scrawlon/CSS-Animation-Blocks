
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

    /* Convert human-readable time "00:00.000" keys into milliseconds */
    for ( const timeString in this.block ) {
      const time = timeString.split(':');

      if ( time.length && time.length === 2 ) {
        const minutes = Math.floor(time[0] * 60000);
        const milliseconds = Math.floor(time[1].replace('.', ''));
        const blockTime = minutes + milliseconds + globalOffsetTime;
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

  function getRemainingAnimations(element, animationName) {
    const animations = element.style.animation.split(',');
    return animations.filter((animation) => {
      return !animation.match(animationName);
    }).join(',');
  }

  function getKeyframeProps(styleSheets, animationName) {
    let props = [];

    for ( let styleSheet of styleSheets ) {
      const { rules } = styleSheet;

      for ( let rule of rules ) {
        if ( rule.type === 7 && rule.name === animationName ) {
          const { cssText } = rule;
          const cssProps = [...new Set(cssText.match(/\w+(?=:)/g))];

          props = props.concat(cssProps);
        }
      }
    }

    return props;
  }

  function createTransformWrappers(elementSelector, totalWrappers) {
    const elements = document.querySelectorAll(elementSelector);
    let count = 0;

    elements.forEach((element, index) => {
      let currentWrapper;

      while ( count < totalWrappers ) {
        currentWrapper = document.createElement('div');
        currentWrapper.classList.add('transform-wrapper');

        if ( index = elements.length - 1 ) {
          let elementStyle = window.getComputedStyle(element);

          currentWrapper.style.width = element.clientWidth + 'px';
          currentWrapper.style.height = element.clientHeight + 'px';

          if ( elementStyle.position ) {
            currentWrapper.style.position = elementStyle.position;
            currentWrapper.style.top = elementStyle.top;
            currentWrapper.style.bottom = elementStyle.bottom;
            currentWrapper.style.left = elementStyle.left;
            currentWrapper.style.right = elementStyle.right;
          }
        }
        element.parentNode.insertBefore(currentWrapper, element);
        currentWrapper.appendChild(element);
        count++;
      }

      count = 0;
    });
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

  function cacheDomElement(elementSelector, transformCount) {
    const elements = document.querySelectorAll(elementSelector)

    dom[elementSelector] = {
      elements: elements,
      transformWrapLevel: Array(elements.length).fill(0)
    };

    createTransformWrappers(elementSelector, transformCount);
  }

  function getGroupOffsetTimes(groupOffset) {
    if ( !groupOffset ) return 0;

    const { delayTime, randomMinMaxDelayTimes } = groupOffset;

    if ( delayTime && delayTime === Math.floor(delayTime) ) {
      return delayTime;
    } else if ( randomMinMaxDelayTimes && Array.isArray(randomMinMaxDelayTimes) && randomMinMaxDelayTimes.length >= 2 ) {
      const [ min, max ] = randomMinMaxDelayTimes;
      return getRandomInt(min, max);
    }

    return 0;
  }

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }
}

export { AnimationBlock };
