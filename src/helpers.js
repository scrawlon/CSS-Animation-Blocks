
const styleSheets = document.styleSheets;
let cssKeyframeProps = {};
let dom = {};

function addAnimationEventListeners(element) {
  const { tagName, className } = element;

  element.addEventListener('animationstart', (event) => handleAnimationStart(event));
  element.addEventListener('animationend', (event) => handleAnimationEnd(event));

  function handleAnimationStart(event) {
    const { animationName } = event;

    if ( !cssKeyframeProps[animationName] ) {
      cssKeyframeProps[animationName] = getKeyframeProps(styleSheets, animationName);
    }

    /* remove inline styles associated that might override current animation */
    cssKeyframeProps[animationName].forEach((style) => {
      if ( style !== 'transform' ) element.style.removeProperty(style);
    });
  }

  function handleAnimationEnd(event) {
    const { animationName } = event;
    const endStyles = getComputedStyle(element);
    const remainingAnimations = getRemainingAnimations(element, animationName);

    /* Hold animated CSS property values after animation is removed from element */
    cssKeyframeProps[animationName].forEach((style) => {
      element.style[style] = endStyles.getPropertyValue(style);
    });

    if ( !remainingAnimations ) {
      element.removeEventListener('animationstart', (event) => handleAnimationStart(event));
      element.removeEventListener('animationend', (event) => handleAnimationEnd(event));
    }

    element.style.animation = remainingAnimations;
  }
}

function cacheDomElement(elementSelector, transformCount) {
  const elements = document.querySelectorAll(elementSelector)

  dom[elementSelector] = {
    elements: elements,
    transformWrapLevel: Array(elements.length).fill(0)
  };

  createTransformWrappers(elementSelector, transformCount);
}

function createTransformWrappers(elementSelector, totalWrappers) {
  const elements = document.querySelectorAll(elementSelector);
  let elementStyle = '';
  let count = 0;

  elements.forEach((element, index) => {
    let currentWrapper;

    if ( !elementStyle ) {
      elementStyle = window.getComputedStyle(element);
    }

    while ( count < totalWrappers ) {
      currentWrapper = document.createElement('div');
      currentWrapper.classList.add('transform-wrapper');

      if ( count === totalWrappers - 1 ) {
        currentWrapper.style.width = element.clientWidth + 'px';
        currentWrapper.style.height = element.clientHeight + 'px';
        currentWrapper.style.margin = elementStyle.margin;
        currentWrapper.style.padding = elementStyle.padding;

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

function getDelayRangeRandomOffset(groupOffset) {
  const { delayTime, delayRange } = groupOffset;

  if ( delayTime && typeof delayTime === 'number' ) return delayTime;

  if ( delayRange && Array.isArray(delayRange) && delayRange.length >= 2 ) {
    const [ min, max ] = delayRange;
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

function resetDomElements(domElements) {
  const domElementKeys = domElements ? Object.keys(domElements) : false;

  if ( !domElementKeys ) return false;

  domElementKeys.forEach((domElementKey) => {
    const { elements } = domElements[domElementKey];

    elements.forEach(element => element.style = '');
  });
}

export { addAnimationEventListeners, cacheDomElement, dom, getBlockTime, getDelayRangeRandomOffset, getTransformWrapElement, resetDomElements }
