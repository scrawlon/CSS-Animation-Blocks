# CSS Animation Blocks
_This JavaScript library fulfills two main goals_

1. **CSS Animation:** _Web designers and frontend developers can collaborate on simple motion sequences with CSS animation keyframes._

2. **Animation blocks (timeline):** _CSS animation keyframes can be combined into blocks (ex. intro, title-sequence, credits). These blocks can then be added to a final timeline._

## Installation
coming soon

## CSS animation
Creating an animation block requires CSS animations. The following 'fade-in' class defines a 1 second animation (opacity 0 to 1).

_For these examples, I'm only including the @keyframes syntax. You may need to add the @-webkit-keyframes and other vendor prefixes._

```CSS
.fade-in {
  animation-name: fade-in 1s;
}

@keyframes fade-in {
  0%   { opacity: 0; }
  100% { opacity: 1; }    
}
```

If you create an html file and add the 'fade-in' class to a div, the animation will occur as soon as the page loads. You can adjust the start time by adding 'animation-delay', but as you add more elements it can be difficult to maintain. This is where animation blocks can help.

## Animation Blocks
Now that we have a CSS animation, we need an html element to apply it to. Here's a div with a 'box' class. Its opacity is set to 0, so it will not be visible on page load.

```html
<style>
  .box {
    opacity: 0;
    background: red;
    width: 100px;
    height: 100px;
  }

  .fade-in {
    animation-name: fade-in 1s;
  }

  @keyframes fade-in {
    0%   { opacity: 0; }
    100% { opacity: 1; }    
  }    
</style>

<div class="box"></div>

<script>/* CSS Animation Blocks JavaScript code goes here */</script>
```

CSS Animation Blocks hold timeline events in objects with keys representing event times in 'Minutes:Seconds' format. You just require the library and add the timeline.

Here's a CSS Animation Block code to run the 'fade-in' animation on the '.box' div:

```JavaScript
var animationBlocks = require('css-animation-blocks');
var box = document.querySelector('.box');
var timeline = {
  '00:01': {
    animations: [
      {
        elements: box,
        animationSelector: '.fade-in'
      }
    ]}
}

animationBlocks.load(timeline);
animationBlocks.start();
```
