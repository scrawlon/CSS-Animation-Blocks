
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

        dom[elementSelector].elements = document.querySelectorAll(elementSelector);

        if ( !dom[elementSelector].wrapNext ) dom[elementSelector].wrapNext = false;

        dom[elementSelector].elements.forEach((element, index) => {
          if ( !animationCSS || !Array.isArray(animationCSS) ) return false;

          const runningAnimations = element.style.animation;
          let currentAnimations = animationCSS.join(',');
          let currentKeyframeProps = {};
          let currentWrapper;

          if ( dom[elementSelector].wrapNext ) {
            currentWrapper = document.createElement('div');
            element.parentNode.insertBefore(currentWrapper, element);
            currentWrapper.appendChild(element);
            element = currentWrapper;
          }

          if ( runningAnimations && !currentWrapper ) {
            element.style.animation = `${runningAnimations},${currentAnimations}`;
          } else {
            element.style.animation = `${currentAnimations}`;
          }

          element.addEventListener('animationstart', (event) => {
            const { animationName } = event;

            /* Keep track of CSS properties of current animation's keyframes */
            if ( !currentKeyframeProps[animationName] ) {
              currentKeyframeProps[animationName] = getKeyframeProps(styleSheets, animationName);
            }

            /* remove inline styles associated that might override current animation */
            currentKeyframeProps[animationName].forEach((style) => {
              if ( style === 'transform' ) {
                dom[elementSelector].wrapNext = true;
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
              element.style[style] = endStyles.getPropertyValue(style);
            });

            const remainingAnimations = getRemainingAnimations(element, animationName);

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
}

export { AnimationBlock };
