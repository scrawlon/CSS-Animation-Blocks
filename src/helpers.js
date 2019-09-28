
const styleSheets = document.styleSheets;
let cssKeyframeProps = {};

function addAnimationEventListeners(element) {
  const { tagName, className } = element;
  const elementKey = `${tagName}.${className}`;

  if ( !cssKeyframeProps[elementKey] ) cssKeyframeProps[elementKey] = {};

  element.addEventListener('animationstart', (event) => {
    const { animationName } = event;

    if ( !cssKeyframeProps[elementKey][animationName] ) cssKeyframeProps[elementKey][animationName] = getKeyframeProps(styleSheets, animationName);

    /* remove inline styles associated that might override current animation */
    cssKeyframeProps[elementKey][animationName].forEach((style) => {
      if ( style !== 'transform' ) element.style.removeProperty(style);
    });
  });

  element.addEventListener('animationend', (event) => {
    const { animationName } = event;
    const endStyles = getComputedStyle(element);
    const remainingAnimations = getRemainingAnimations(element, animationName);

    if ( !cssKeyframeProps[elementKey][animationName] ) cssKeyframeProps[elementKey][animationName] = getKeyframeProps(styleSheets, animationName);

    /* Hold animated CSS property values after animation is removed from element */
    cssKeyframeProps[elementKey][animationName].forEach((style) => {
      element.style[style] = endStyles.getPropertyValue(style);
    });

    element.style.animation = remainingAnimations;
  });
}

function createTransformWrappers(elementSelector, totalWrappers) {
  const elements = document.querySelectorAll(elementSelector);
  let count = 0;

  elements.forEach((element, index) => {
    let currentWrapper;

    while ( count < totalWrappers ) {
      currentWrapper = document.createElement('div');
      currentWrapper.classList.add('transform-wrapper');

      if ( index === elements.length - 1 ) {
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

function getBlockTime(timeString, globalOffsetTime) {
  const time = timeString.split(':');

  /* Convert human-readable time "00:00.000" keys into milliseconds */
  if ( time.length && time.length === 2 ) {
    const minutes = Math.floor(time[0] * 60000);
    const milliseconds = Math.floor(time[1].replace('.', ''));

    return minutes + milliseconds + globalOffsetTime;
  }

  return -1;
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

function getRemainingAnimations(element, animationName) {
  const animations = element.style.animation.split(',');
  return animations.filter((animation) => {
    return !animation.match(animationName);
  }).join(',');
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

export { addAnimationEventListeners, createTransformWrappers, getBlockTime, getGroupOffsetTimes, getKeyframeProps, getRandomInt, getRemainingAnimations }
