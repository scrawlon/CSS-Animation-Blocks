# CSS Animation Blocks
_A JavaScript library for managing and applying CSS animations with the following features:_

1. **"Animation Blocks:** Uses JavaScript objects to manage animation blocks in timeline format. Blocks can be nested, allowing complex animations by combining small, easily-maintained blocks.

2. **Transforms:** Applies CSS transforms to wrapper elements, so multiple transforms can be used at the same time. Wrapper elements are created automatically at run time. Without wrapper elements, transforms would cancel each other out.

## Installation
coming soon

## How it Works

### Start with HTML
Here's an html page containing one _"div"_ with class _"box"_.


```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CSS Animation Blocks</title>
  <link href="style.css" rel="stylesheet">
  <script src="index.js" type="module"></script>
</head>
<body>

  <div class="box"></div>

</body>
</html>
```

There are also _"style.css"_ and _"index.js"_ files included. That's where we'll place our CSS Animations and Animation Blocks code for the _"box"_ element.

### CSS
In the _"style.css"_ file, add styles to set the _"box"_ element's initial state, and create animation keyframes that can be applied with Animation Blocks.

The following styles create a square red box with _"opacity"_ set to 0 (invisible), and keyframes _"fade-in"_ that will animate _"opacity"_ from 0-1.

> _NOTE: These examples only include the @keyframes syntax. You may require @-webkit-keyframes and other vendor prefixes for cross-browser compatibility._

```CSS
.box {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  background: red;
  opacity: 0;
}

@keyframes fade-in {
  0%   { opacity: 0; }
  100% { opacity: 1; }    
}
```

Opening the html file in a browser now, would show an empty page. Create an Animation Block to apply the _"fade-in"_ keyframes to the _"box"_ element.

### Create an Animation Block
In the _"index.js"_ file, import the AnimationBlock code and create a new AnimationBlock:

```JavaScript
import { AnimationBlock } from 'css-animation-blocks');

const myBlock = new AnimationBlock({
  '00:00.000': {
    animations: [
      {
        elementSelector: '.box',
        animationCSS: [
          'fade-in 1s ease normal forwards',
        ]
      }
    ]
  }
},{});

myBlock.start();
```

At time _"00:00.000"_ we have an _animations_ array containing one animation object. It's target elementSelector _".box"_ and apply the _"fade-in"_ keyframes for a duration 1 second.
