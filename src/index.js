
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
      // console.log({timestamp});

      animations.forEach((animation) => {
        const { elementSelector, animationCSS } = animation;

        if ( !elementSelector ) return false;
        if ( !dom[elementSelector] ) dom[elementSelector] = {};

        dom[elementSelector].elements = document.querySelectorAll(elementSelector);

        dom[elementSelector].elements.forEach((element, index) => {
          if ( animationCSS ) {
            const runningAnimations = element.style.animation;
            let currentAnimations = [];
            let currentKeyframeProps = {};
            let currentWrapper;

            currentAnimations.push(animationCSS);

            console.log({wrapNext: dom[elementSelector].wrapNext});

            if ( dom[elementSelector].wrapNext ) {
              currentWrapper = document.createElement('div');
              element.parentNode.insertBefore(currentWrapper, element);
              currentWrapper.appendChild(element);
              element = currentWrapper;
            }

            if ( runningAnimations && !currentWrapper ) {
              console.log({runningAnimations});
              element.style.animation = `${runningAnimations},${currentAnimations.join(',')}`;
            } else {
              element.style.animation = `${currentAnimations.join(',')}`;
            }

            element.addEventListener('animationstart', (event) => {
              const { animationName } = event;

              // console.log({'animation start': animationName});

              /* Keep track of CSS properties of current animation's keyframes */
              if ( !currentKeyframeProps[animationName] ) {
                currentKeyframeProps[animationName] = getKeyframeProps(styleSheets, animationName);
              }
              // console.log({currentAnimations: dom[elementSelector].keyframeProps[animationName]});
              // console.log({domElementObject: dom[elementSelector]});

              /* remove inline styles associated that might override current animation */
              currentKeyframeProps[animationName].forEach((style) => {
                dom[elementSelector].wrapNext = false;
                // console.log({style});
                if ( style === 'transform' ) {
                  dom[elementSelector].wrapNext = true;
                }

                if ( !dom[elementSelector].wrapNext ) {
                  element.style.removeProperty(style);
                }

              });

              // console.log({animations: dom[elementSelector].animations});
            });

            element.addEventListener('animationend', (event) => {
              const { animationName } = event;
              const endStyles = getComputedStyle(element);

              // console.log({'animation end': animationName});

              if ( !currentKeyframeProps[animationName] ) {
                currentKeyframeProps[animationName] = getKeyframeProps(styleSheets, animationName);
              }

              /* Hold animated CSS property values after animation is removed from element */
              currentKeyframeProps[animationName].forEach((style) => {
                const cssValue = endStyles.getPropertyValue(style);
                console.log({style});
                console.log({cssValue});
                console.log({element});

                if ( style !== 'transform' ) element.style[style] = cssValue;
              });

              const remainingAnimations = getRemainingAnimations(element, animationName);
              // console.log({currentAnimation: animationName});

              element.style.animation = remainingAnimations;
              // element.classList.remove(animationClass);
            });
          }
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
