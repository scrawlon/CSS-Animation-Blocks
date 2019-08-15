
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
        dom[elementSelector].animations = [];
        dom[elementSelector].keyframeProps = [];

        dom[elementSelector].elements.forEach((element) => {
          if ( animationCSS ) {
            dom[elementSelector].animations.push(animationCSS);
            element.style.animation = dom[elementSelector].animations.join(',');

            element.addEventListener('animationstart', (event) => {
              const { animationName } = event;

              // console.log({'animation start': animationName});
              if ( !dom[elementSelector].keyframeProps[animationName] ) {
                dom[elementSelector].keyframeProps[animationName] = getKeyframeProps(styleSheets, animationName);
              }
              // console.log({currentAnimations: dom[elementSelector].keyframeProps[animationName]});
              // console.log({domElementObject: dom[elementSelector]});

              // dom[elementSelector].keyframeProps[animationName].forEach((style) => {
              //   element.style.removeProperty(style);
              // });
            });

            element.addEventListener('animationend', (event) => {
              const { animationName } = event;
              const endStyles = getComputedStyle(element);
              // let styles = '';

              // console.log({'animation end': animationName});

              // if ( !dom[elementSelector].keyframeProps[animationName] ) {
              //   dom[elementSelector].keyframeProps[animationName] = getKeyframeProps(styleSheets, animationName);
              // }

              // console.log({currentAnimations: dom[elementSelector].keyframeProps[animationName]});

              dom[elementSelector].keyframeProps[animationName].forEach((style) => {
                const cssValue = endStyles.getPropertyValue(style);
                console.log({style});
                console.log({cssValue});
                // styles += `${style}:${cssValue};`;
                element.style[style] = cssValue;
              });

              /* remove this animation */
              const remainingAnimations = getRemainingAnimations(element, animationName);
              // console.log({currentAnimation: animationName});

              element.style.animation = remainingAnimations;
              // console.log({currentAnimation: element.style.animation});

              // element.style.cssText = styles;
              // element.classList.remove(animationClass);

              // console.log({event});
              // console.log({styles});
              // console.log({keyframeProps});
              // console.log({dom});
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
