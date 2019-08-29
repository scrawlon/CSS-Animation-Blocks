
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
  const styleSheets = document.styleSheets;
  const timeline = this.processedTimeline();
  const animationTimes = Object.keys(timeline);
  const lastAnimationIndex = animationTimes.length - 1;
  let nextAnimationIndex = 0;
  let startTime;
  let dom = {};

  console.log({timeline});

  requestAnimationFrame(animation);

  function animation(timestamp) {
    if (!startTime) startTime = timestamp;

    const elapsedTime = timestamp - startTime;
    const nextAnimationTime = animationTimes[nextAnimationIndex];

    if ( elapsedTime >= nextAnimationTime ) {
      const { animations } = timeline[nextAnimationTime];

      animations.forEach((animation) => {
        const { elementSelector, animationCSS } = animation;

        if ( !elementSelector ) return false;
        if ( !dom[elementSelector] ) dom[elementSelector] = {};
        if ( !dom[elementSelector].wrapLevel ) dom[elementSelector].wrapLevel = 0;
        if ( !dom[elementSelector].elements ) {
          const elements = document.querySelectorAll(elementSelector);

          dom[elementSelector].elements = elements;
          getWrappedElements(elementSelector, 3);
        }

        dom[elementSelector].elements.forEach((element, index) => {
          if ( !animationCSS || !Array.isArray(animationCSS) ) return false;

          const runningAnimations = element.style.animation;
          let currentAnimations = animationCSS.join(',');
          let currentKeyframeProps = {};

          if ( dom[elementSelector].wrapLevel ) {
            let currentElement = element;
            let count = 0;

            while ( count < dom[elementSelector].wrapLevel ) {
              currentElement = currentElement.parentElement;
              console.log({currentElement});
              count++;
            }

            if ( currentElement.classList.contains('cab-transform-wrapper') ) {
              element = currentElement;
            }
          }

          if ( runningAnimations ) {
            // console.log({runningAnimations, currentAnimations});
            element.style.animation = `${runningAnimations},${currentAnimations}`;
          } else {
            // console.log({currentAnimations});
            element.style.animation = `${currentAnimations}`;
          }

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
                dom[elementSelector].wrapLevel++;
              } else {
                element.style.removeProperty(style);
              }
            });
          });

          element.addEventListener('animationend', (event) => {
            const { animationName } = event;
            const endStyles = getComputedStyle(element);

            if ( !currentKeyframeProps[animationName] ) {
              currentKeyframeProps[animationName] = getKeyframeProps(styleSheets, animationName);
            }

            /* Hold animated CSS property values after animation is removed from element */
            currentKeyframeProps[animationName].forEach((style) => {
              // console.log({style});
              element.style[style] = endStyles.getPropertyValue(style);
            });

            const remainingAnimations = getRemainingAnimations(element, animationName);
            // console.log({remainingAnimations});

            element.style.animation = remainingAnimations;
            // element.classList.remove(animationClass);
          });
        });
      });

      nextAnimationIndex++;
    }

    if ( nextAnimationIndex <= lastAnimationIndex ) {
      requestAnimationFrame(animation);
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

  function getWrappedElements(elementSelector, totalWrappers) {
    const elements = document.querySelectorAll(elementSelector);
    let count = 0;

    elements.forEach((element) => {
      let currentWrapper;

      while ( count < totalWrappers ) {
        currentWrapper = document.createElement('div');
        currentWrapper.classList.add('cab-transform-wrapper')
        element.parentNode.insertBefore(currentWrapper, element);
        currentWrapper.appendChild(element);
        count++;
      }
    });
  }
}

export { AnimationBlock };
