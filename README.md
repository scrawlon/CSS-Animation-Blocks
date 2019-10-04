# CSS Animation Blocks
_A JavaScript library for managing and applying CSS animations with the following features:_

1. **"Animation Blocks:** Uses JavaScript objects to manage animation blocks in timeline format. Blocks can be nested, allowing complex animations by combining small, easily-maintained blocks.

2. **Multiple Transform Animations:** To allow multiple sequential transform animations, CSS Animation Blocks creates nested wrapper elements around your elements. Each transform animation is applied to its own wrapper element. Without wrapper elements, transforms would cancel each other out.

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

The following styles create a square red box with _"opacity"_ set to 0 (invisible), and keyframes _"fade-in"_, _"move-down"_,  _"background-red"_ and _"rotate"_.

> _NOTE: These examples only include the @keyframes syntax. You may require @-webkit-keyframes and other vendor prefixes for cross-browser compatibility._

```CSS
.container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  font-size: 1.4rem;
  text-transform: lowercase;
  font-family: sans-serif;
  padding: 0;
  margin: 0;
}

.box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 240px;
  height: 180px;
  background: black;
  opacity: 0;
  position: relative;
  border-radius: 10px;
  padding: 0;
  margin: 1em;
  overflow: hidden;
}

h1 {
  width: 100%;
  text-align: center;
  color: #fff;
  opacity: 0;
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

@keyframes rotate {
  to { transform: rotate(360deg); }
}
```

Opening the html file in a browser now would show an empty page, because our elements have '0' opacity. Create an Animation Block to apply the _"fade-in"_, _"move-down"_ and _"background-red"_ keyframes to the _"box"_ element.

### JavaScript
In the _"index.js"_ file, import the AnimationBlock library and create a new AnimationBlock:

```JavaScript
import { AnimationBlock } from 'css-animation-blocks');

const mainBlock = new AnimationBlock({
  '00:00.000': {
    animations: [
      {
        elementSelector: '.box',
        cssAnimation: [
          'fade-in 1s ease normal forwards',
          'background-colors 1s steps(1) normal forwards',
        ],
        cssTransform: {
          translateY: 'move-down 2s ease normal forwards',
        },
      },
    ]
  }
},{});

mainBlock.start();
```

At time _"00:00.000"_ we have an _animations_ array containing an animation objects. Each animation object:
* Must have one _"elementSelector"_. The _"elementSelector"_ above targets _".box"_ (all elements with the class "box").
* Can (optionally) have one _"cssAnimation"_ array containing CSS animation shorthand strings.
* Can (optionally) have one _"cssTransform"_ object. Object keys should match the transform type, and the values are CSS animation shorthand strings.

The animation block above applies three animations, _"fade-in"_, _"background-colors"_ and _"move-down"_. Load the page in a browser and you should see the box fade in, move down and turn red.

> _NOTE: Animations are written in standard CSS animation shorthand. For more info, [visit the MDN web docs](https://developer.mozilla.org/en-US/docs/Web/CSS/animation)_

### Nested Blocks

One benefit of CSS Animation Blocks is that you can include blocks in other blocks. To illustrate let's extend the previous example by moving the _".box"_ animation into its own block, and include that block in the _"mainBlock"_.

```JavaScript
import { AnimationBlock } from 'css-animation-blocks');

const boxBlock = new AnimationBlock({
  '00:00.000': {
    animations: [
      {
        elementSelector: '.box',
        cssAnimation: [
          'fade-in 1s ease normal forwards',
          'background-red 1.5s steps(1) normal forwards',
        ],
        cssTransform: {
          translateY: 'move-down 2s ease normal forwards',
        },
      },
    ]
  }
},{});

const mainBlock = new AnimationBlock({
  '00:00.000': {
    blocks: [boxBlock]
  }
},{});

mainBlock.start();
```

We created a new Animation Block named _"boxBlock"_. To nest that block in our _"mainBlock"_, we added a _"blocks"_ array containing the new block.

Nested blocks can also contain other nested blocks. Here, we'll add a new block to animate the _"h1"_ element in our _".box"_ element, and we'll nest the new block in the _"boxBlock"_.

```JavaScript
import { AnimationBlock } from 'css-animation-blocks');

const titleBlock = new AnimationBlock({
  '00:00.000': {
    animations: [
      {
        elementSelector: 'h1',
        cssAnimation: [
          'fade-in 1s ease normal forwards',
        ],
        cssTransform: {
          scale: 'scale-down 1s ease normal forwards',
        },
      }
    ]
  },
  '00:05.500': {
    animations: [
      {
        elementSelector: 'h1',
        cssTransform: {
          scale: 'scale-down 3s linear reverse forwards',
        },
      }
    ]
  },
},{});

const boxBlock = new AnimationBlock({
  '00:00.000': {
    blocks: [titleBlock],
    animations: [
      {
        elementSelector: '.box',
        cssAnimation: [
          'fade-in 1s ease normal forwards',
          'background-red 1s steps(1) normal forwards',
        ],
        cssTransform: {
          translateY: 'move-down 2s ease normal forwards',
        },
      },
    ]
  },
  '00:05.500': {
    animations: [
      {
        elementSelector: '.box',
        cssAnimation: [
          'background-red 1.5s steps(1) normal forwards',
        ],
        cssTransform: {
          rotate: 'rotate 2s ease normal forwards 1',
        },
      }
    ]
  },
  '00:06.500': {
    animations: [
      {
        elementSelector: '.box',
        cssAnimation: [
          'fade-in 1s ease reverse forwards',
        ],
      }
    ]
  },
},{});

const mainBlock = new AnimationBlock({
  '00:00.000': {
    blocks: [boxBlock]
  }
},{});

mainBlock.start();
```

### Group Offset

So far, we've looked at animations on single elements, one _".box"_ and one _"h1"_, but those selectors could apply to multiple elements. Let's duplicate the existing _".box"_ element and see how the animation is applied. Change the _".container"_ div in _"index.html"_ to match this:

```HTML
<div class="container">
  <div class="box">
    <h1>CSS</h1>
  </div>
  <div class="box">
    <h1>Animation</h1>
  </div>
  <div class="box">
    <h1>Blocks</h1>
  </div>
</div>
```

Now, if you reload the page, you should see three boxes all animating at the same time. This is fine, but what if you wanted to run the same animation on those elements, but delay the start of each element to create a "stepped" animation?

Each element in an _"animations"_ array can include a _"groupOffset"_ object with a _"delayTime"_ key, containing a time in milliseconds. If the animation applies to multiple elements, each element will be delayed by the _"groupOffset.delayTime"_ amount. Let's update the first animation in the _"boxBlock"_ and add a _"groupOffset"_:

```JavaScript
'00:00.000': {
  blocks: [titleBlock],
  animations: [
    {
      elementSelector: '.box',
      cssAnimation: [
        'fade-in 1s ease normal forwards',
        'background-red 1s steps(1) normal forwards',
      ],
      cssTransform: {
        translateY: 'move-down 2s ease normal forwards',
      },
      groupOffset: {
        delayTime: 300
      }
    },
  ]
},
```

Now reload the page, and each block should have a slight pause before fading in. You can add a different groupOffset for each object in an _"animations"_ array. Trying copy the _"groupOffset"_ from the _".box"_ element and adding it to the first animation in the _"titleBlock"_. That should make the _"h1"_ elements appear one-at-a-time, as each _".box"_ turns red.

What if you want all animations in a block to have the same groupOffset? It's possible to set a default offset for an entire block in the configuration settings.

## Configuration

Animation Blocks have a second optional parameter for setting configurations. The options are _"defaults"_  and _"loop"_.

For example, you can see the config object here:

```JavaScript
const mainBlock = new AnimationBlock({
  '00:01.000': {
    animations: []
  }
},{
  defaults: {},
  loop: true
});
```

### Defaults
When an entire Animation Block targets a single _"elementSelector"_, it can be tedious to enter the same _"elementSelector"_ and _"groupOffset"_ in each time entry. That's where the _"defaults"_ config settings can help.

Any settings you add to the _"defaults"_ config will apply to all objects in the _"animations"_ array that do not already have those settings applied.

#### Default Element Selector
The _"boxBlock"_ Animation Block we've been working applies animations to _".box"_ elements, and each animation time key includes the same _"elementSelector"_ for _".box"_. We can simplify our code, and save some future typing, by applying a Default Element Selector to this Animation Block.

Here's the same code as before, but using a Default Element Selector:

```JavaScript
const boxBlock = new AnimationBlock({
  '00:00.000': {
    blocks: [titleBlock],
    animations: [
      {
        cssAnimation: [
          'fade-in 1s ease normal forwards',
          'background-red 1s steps(1) normal forwards',
        ],
        cssTransform: {
          translateY: 'move-down 2s ease normal forwards',
        },
        groupOffset: {
          delayTime: 300
        }
      },
    ]
  },
  '00:05.500': {
    animations: [
      {
        cssAnimation: [
          'background-red 1.5s steps(1) normal forwards',
        ],
        cssTransform: {
          rotate: 'rotate 2s ease normal forwards 1',
        },
      }
    ]
  },
  '00:06.500': {
    animations: [
      {
        cssAnimation: [
          'fade-in 1s ease reverse forwards',
        ],
      }
    ]
  },
},{
  defaults: {
    elementSelector: '.box',
  }
});
```

As you can see, all _"elementSelector"_ keys were removed from individual _"animations"_ array objects, and a _"defaults.elementSelector"_ setting was added to the config object. If you reload the page, the animation should continue working as before.

#### Default Group Offset

When an entire Animation Block applies to an _"elementSelector"_ targeting multiple elements, and the same _"groupOffset"_ should apply to all animations, it can be tedious to add the same setting over-and-over, especially if you need to change that setting later. This situation can be handled with a Default Group Offset.

Here's the _"boxBlock"_ Animation Block with a Default Group Offset config setting added.

```JavaScript
const boxBlock = new AnimationBlock({
  '00:00.000': {
    blocks: [titleBlock],
    animations: [
      {
        cssAnimation: [
          'fade-in 1s ease normal forwards',
          'background-red 1s steps(1) normal forwards',
        ],
        cssTransform: {
          translateY: 'move-down 2s ease normal forwards',
        },
      },
    ]
  },
  '00:05.500': {
    animations: [
      {
        cssAnimation: [
          'background-red 1.5s steps(1) normal forwards',
        ],
        cssTransform: {
          rotate: 'rotate 2s ease normal forwards 1',
        },
      }
    ]
  },
  '00:06.500': {
    animations: [
      {
        cssAnimation: [
          'fade-in 1s ease reverse forwards',
        ],
      }
    ]
  },
},{
  defaults: {
    elementSelector: '.box',
    groupOffset: {
      delayTime: 300
    }
  }
});
```

### Loop
