
function AnimationBlock(timeline, config) {
  this.timeline = timeline;
  this.config = config;
  this.processedTimeline = function() {
    let output = {};

    for ( const timeString in timeline ) {
      const time = timeString.split(':');

      if ( time.length && time.length === 2 ) {
        const minutes = Math.floor(time[0] * 60000);
        const milliseconds = Math.floor(time[1].replace('.', ''));

        output[minutes + milliseconds] = timeline[timeString];
      } else {
        console.log(`Invalid time: ${timeString}`);
      }
    }

    return output;
  };
}

AnimationBlock.prototype.start = function() {
  const config = this.config;
  const transformCount = config.transformCount ? config.transformCount : 1;
  const styleSheets = document.styleSheets;
  const timeline = this.processedTimeline();
  const animationTimes = Object.keys(timeline);
  const lastAnimationIndex = animationTimes.length - 1;
  let nextAnimationIndex = 0;
  let startTime;
  let dom = {};

  console.log({timeline});
  console.log({config: this.config});

  requestAnimationFrame(animation);

  function animation(timestamp) {
    if (!startTime) startTime = timestamp;

    if ( timestamp - startTime >= animationTimes[nextAnimationIndex] ) {
      const { animations } = timeline[animationTimes[nextAnimationIndex]];

      animations.forEach((animation) => {
        const { elementSelector, animationCSS } = animation;

        if ( !elementSelector ) return false;
        if ( !animationCSS || !Array.isArray(animationCSS) ) return false;

        if ( !dom[elementSelector] ) {
          cacheDomElement(elementSelector);
        }

        dom[elementSelector].elements.forEach((element, index) => {
          const runningAnimations = element.style.animation;
          const currentAnimations = animationCSS.join(',');
          let currentKeyframeProps = {};

          if ( dom[elementSelector].transformWrapLevel[index] ) {
            element = getTransformWrapElement(element, dom[elementSelector].transformWrapLevel[index]);
          }

          element.style.animation = runningAnimations && !dom[elementSelector].transformWrapLevel[index]
            ? `${runningAnimations},${currentAnimations}`
            : `${currentAnimations}`;

          element.addEventListener('animationstart', (event) => {
            const { animationName } = event;
            console.log({animationName});

            /* Keep track of CSS properties of current animation's keyframes */
            if ( !currentKeyframeProps[animationName] ) {
              currentKeyframeProps[animationName] = getKeyframeProps(styleSheets, animationName);
            }

            /* remove inline styles associated that might override current animation */
            currentKeyframeProps[animationName].forEach((style) => {
              if ( style === 'transform' ) {
                if ( dom[elementSelector].transformWrapLevel[index] < transformCount ) {
                  dom[elementSelector].transformWrapLevel[index]++;
                } else {
                  dom[elementSelector].transformWrapLevel[index] = 0;
                }

                element.dataset.animationName = animationName;
              }

              element.style.removeProperty(style);
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

              // if ( style === 'transform' ) delete element.dataset.animationName;
            });

            element.style.animation = remainingAnimations;
            // element.classList.remove(animationClass);
          });
        });
      });

      nextAnimationIndex++;
    }

    if ( nextAnimationIndex <= lastAnimationIndex ) {
      requestAnimationFrame(animation);
    } else if ( config.loop ) {
      console.log('loopnow');

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

    elements.forEach((element) => {
      let currentWrapper;

      while ( count < totalWrappers ) {
        currentWrapper = document.createElement('div');
        currentWrapper.classList.add('transform-wrapper');
        element.parentNode.insertBefore(currentWrapper, element);
        currentWrapper.appendChild(element);
        count++;
      }

      count = 0;
    });
  }

  function getTransformWrapElement(element, transformWrapLevel) {
    let currentElement = element;
    let count = 0;

    while ( count < transformWrapLevel ) {
      const parent = currentElement.parentElement;

      if ( parent.classList.contains('transform-wrapper') ) {
        currentElement = parent;
      }

      if ( !parent.dataset.animationName ) return parent;

      count++;
    }

    return currentElement;
  }

  function cacheDomElement(elementSelector) {
    const elements = document.querySelectorAll(elementSelector)
    dom[elementSelector] = {
      elements: elements,
      transformWrapLevel: Array(elements.length).fill(0)
    };

    createTransformWrappers(elementSelector, transformCount);
  }

}

export { AnimationBlock };
