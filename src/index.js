
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
    let keyframeProps = {};

    if ( elapsedTime >= animationTimes[nextAnimationIndex] ) {
      const animations = timeline[animationTimes[nextAnimationIndex]].animations;

      animations.forEach((animation) => {
        const { elementSelector, animationClass, animationStyles } = animation;

        if ( !elementSelector ) return false;
        if ( !dom[elementSelector] ) dom[elementSelector] = {};

        dom[elementSelector].elements = document.querySelectorAll(elementSelector);

        dom[elementSelector].elements.forEach((element) => {
          if ( animationClass ) {
            let styles = '';

            if ( animationStyles ) {
              for ( let style in animationStyles ) {
                styles += `animation-${style}: ${animationStyles[style]}`;
              }
            }

            element.classList.add(animationClass);
            element.style.cssText = styles;

            element.addEventListener('animationstart', (event) => {
              const { animationName } = event;

              if ( !keyframeProps[animationName] ) {
                keyframeProps[animationName] = getKeyframeProps(styleSheets, animationName);
              }

              keyframeProps[animationName].forEach((style) => {
                element.style.removeProperty(style);
              });
            });

            element.addEventListener('animationend', (event) => {
              const { animationName } = event;
              const endStyles = getComputedStyle(element);
              let styles = '';

              if ( !keyframeProps[animationName] ) {
                keyframeProps[animationName] = getKeyframeProps(styleSheets, animationName);
              }

              keyframeProps[animationName].forEach((style) => {
                styles += `${style}:${endStyles.getPropertyValue(style)}`;
              });

              element.style.cssText = styles;
              element.classList.remove(animationClass);

              console.log({event});
              console.log({styles});
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

  function getKeyframeProps(styleSheets, rule) {
    let props = [];

    for ( let styleSheet of styleSheets ) {
      const { rules } = styleSheet;

      for ( let rule of rules ) {
        if ( rule.type === 7 ) {
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
