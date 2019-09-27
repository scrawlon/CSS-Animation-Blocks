# CSS Animation Blocks
_A JavaScript library for managing and applying CSS animations with the following features:_

1. **"Animation Blocks:** Uses JavaScript objects to manage animation blocks in timeline format. Blocks can be nested, allowing complex animations by combining small, easily-maintained blocks.

2. **Transforms:** Applies CSS transforms to wrapper elements, so multiple transforms can be used at the same time. Wrapper elements are created automatically at run time. Without wrapper elements, transforms would cancel each other out.

## Installation
coming soon

## Basic Tutorial

### HTML
Here's an html page with a _".container div"_, _".box div"_ and an _"h1"_ .


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

  <div class="container">
    <div class="box">
      <h1>CSS Animation Blocks</h1>
    </div>
  </div>

</body>
</html>
```

There are also _"style.css"_ and _"index.js"_ files. That's where we'll place our code for to animate the _"box"_ element.

### CSS
In the _"style.css"_ file, add styles to set the _"box"_ element's initial state, and create animation keyframes that can be applied with Animation Blocks.

The following styles create a square red box with _"opacity"_ set to 0 (invisible), and keyframes _"fade-in"_ that will animate _"opacity"_ from 0-1.

> _NOTE: These examples only include the @keyframes syntax. You may require @-webkit-keyframes and other vendor prefixes for cross-browser compatibility._

```CSS
.container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  font-size: 1.4rem;
  text-transform: lowercase;
  font-family: sans-serif;
  padding: 0;
  margin: 0;
}

.box {
  width: 240px;
  height: 180px;
  background: black;
  opacity: 0;
  position: relative;
  border-radius: 10px;
  padding: 0;
  margin: 0;
}

h1 {
  width: 100%;
  text-align: center;
  color: #fff;
  opacity: 0;
  position: absolute;
  top: 4%;
  padding: 0;
  margin: 0;
}

@keyframes fade-in {
  to { opacity: 1; }    
}

@keyframes move-down {
  0% { transform: translateY(0%); }
  100% { transform: translateY(20%); }
}

@keyframes background-red {
  to { background: red; }
}
```

Opening the html file in a browser now, would show an empty page. Create an Animation Block to apply the _"fade-in"_, _"move-down"_ and _"background-red"_ keyframes to the _"box"_ element.

### JavaScript
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
          'background-colors 1.5s steps(1) normal forwards',
        ],
        transformCSS: {
          translateY: 'move-down 2s ease normal forwards',
        },
      },
    ]
  }
},{});

myBlock.start();
```

At time _"00:00.000"_ we have an _animations_ array containing one animation object. It targets the elementSelector _".box"_ and adds the _"fade-in"_ keyframes. The animation will run for one second.

> _NOTE: Animations are written in standard CSS animation shorthand. For more info, [visit the MDN developer documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/animation)

Load the page in a browser and you should see the box should fade in.
