# CSS Animation Blocks
_A JavaScript library for managing and applying CSS animations with the following features:_

1. **Animation Blocks:** Uses JavaScript objects to manage animation blocks in timeline format.
Blocks can be nested, allowing complex animations by combining small, easily-maintained blocks.

2. **Multiple Transform Animations:** To allow multiple sequential transform animations,
CSS Animation Blocks creates nested wrapper elements around your elements.
Each transform animation is applied to its own wrapper element.
Without wrapper elements, transforms would cancel each other out.

## Installation
Coming soon.

## API

### Instantiate
To create a new AnimationBlock, call `new AnimationsBlock()`
with a block definition object and an optional configuration object.

```JavaScript
const mainBlock = new AnimationBlock({
  '00:00.000': {}
}, {
  Defaults: {},
  Loop: {}
});

mainBlock.start();
```

### AnimationBlock definition objects
Within a block definition object, the main object keys are timecode strings,
in the format 'minutes:seconds.milliseconds (00:00.000)'. This represents the
moment in time your defined animations will start.

Each timecode key holds an object with an **'animations'** array. This is where
you'll call your **'cssAnimation'** and **'cssTransform'** keyframes on a Dom **'elementSelector'** in an html page.

* **'cssAnimation'** is an array of CSS Animations.
* **'cssTransform'** is an object. The keys are the CSS Transform type,
and the values are CSS Animations.
* **'elementSelector'** is a string value for any valid Dom selector that works with `document.querySelectorAll`.

> Use standard CSS animation shorthand syntax.
> [(See the Mozilla docs for detailed info on CSS Animation shorthand)](https://developer.mozilla.org/en-US/docs/Web/CSS/animation)

```JavaScript
const mainBlock = new AnimationBlock({
  '00:00.000': {
    animations: [
      {
        cssAnimation: [
          'fade-in 1s ease normal forwards'
        ],
        cssTransform: {
          rotate: 'rotate 2s ease normal forwards',
        },
        elementSelector: 'h1'
      }
    ]
  }
}, {
  Defaults: {},
  Loop: {}
});

mainBlock.start();
```

The above would add the CSS animation 'fade-in 1s ease normal forwards' and CSS transform animation 'rotate 2s ease normal forwards 1' to all 'h1' elements.  

In order for this to work, you must define CSS keyframes 'fade-in' and 'rotate' in an external CSS stylesheet included in you html page. That CSS might look like this:

```css
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

#### groupOffset

When applying animations to multiple objects, it's possible to add a delay
between each one.

* **'groupOffset'** is an object that contain a **'delayTime'** or **'delayRange'** element.
  * **'delayTime'** is the number of milliseconds to
  wait between applying animations to the each of the chosen elementSelectors.
  * **'delayRange'** is an array containing two 'delayTime' numbers
  representing the randomly selected min/max time to delay between applying
  animations to the each of the chosen elementSelectors.

```JavaScript
const mainBlock = new AnimationBlock({
  '00:00.000': {
    animations: [
      {
        cssAnimation: [
          'fade-in 1s ease normal forwards'
        ],
        cssTransform: {
          rotate: 'rotate 2s ease normal forwards',
        },
        elementSelector: 'h1',
        groupOffset: {
          delayTime: 300
        }
      }
    ]
  }
}, {
  Defaults: {},
  Loop: {}
});

mainBlock.start();
```

The above adds a **'groupOffset'** of 300 milliseconds, so each 'h1' element's
animation will start with a 300 millisecond delay.

#### Nested AnimationBlocks
Another element you can add to timecode objects is a **'blocks'** array.
A complex animation can be split into smaller blocks combined into another
AnimationBlock.

In the previous example, there's a mainBlock with animations applied to an
'h1' elementSelector. Let's move that animation into its own 'h1Block' and
include that in the mainBlock's **'blocks'** array.

```JavaScript
const h1Block = new AnimationBlock({
  '00:00.000': {
    animations: [
      {
        cssAnimation: [
          'fade-in 1s ease normal forwards'
        ],
        cssTransform: {
          rotate: 'rotate 2s ease normal forwards',
        },
        elementSelector: 'h1',
        groupOffset: {
          delayTime: 300
        }
      }
    ]
  }
});

const mainBlock = new AnimationBlock({
  '00:00.000': {
    blocks: [h1Block]
  }
}, {
  defaults: {},
  loop: {}
});

mainBlock.start();
```

### AnimationBlock config object
The optional config object can be used to apply settings to an entire
AnimationBlock.

#### Defaults object
To apply default **'elementSelector'** and **'groupOffset'** settings to
an entire AnimationBlock, use the defaults object. When a default value is
set, that value applies to all animations in the AnimationBlock that don't
already define those values.

```JavaScript
const h1Block = new AnimationBlock({
  '00:00.000': {
    animations: [
      {
        cssAnimation: [
          'fade-in 1s ease normal forwards'
        ],
        cssTransform: {
          rotate: 'rotate 2s ease normal forwards',
        },
      }
    ]
  },
  '00:03.000': {
    animations: [
      {
        cssAnimation: [
          'fade-in 1s ease reverse forwards'
        ],
      }
    ]
  }
}, {
  defaults: {
    elementSelector: 'h1',
    groupOffset: {
      delayTime: 300
    }
  }
});

const mainBlock = new AnimationBlock({
  '00:00.000': {
    blocks: [h1Block]
  }
}, {
  defaults: {},
  loop: {}
});

mainBlock.start();
```

The above **'defaults'** settings applies all animations to the 'h1'
**'elementSelector'**, and sets a 300 millisecond delay before applying the
animation to each 'h1' element on the page.

#### Loop object

Use the **'loop'** object to make an AnimationBlock play multiple times.

* **'count'** is a number representing the number of times to repeat the
AnimationBlock.
* **'infinite'** is a boolean (true/false). If set to true, the AnimationBlock
will repeat continuously.
* **'endTime'** this is a timecode string (00:00.000) indicating when to end
the current loop and start the next loop.

```JavaScript
const h1Block = new AnimationBlock({
  '00:00.000': {
    animations: [
      {
        cssAnimation: [
          'fade-in 1s ease normal forwards'
        ],
        cssTransform: {
          rotate: 'rotate 2s ease normal forwards',
        },
      }
    ]
  },
  '00:03.000': {
    animations: [
      {
        cssAnimation: [
          'fade-in 1s ease reverse forwards'
        ],
      }
    ]
  }
}, {
  defaults: {
    elementSelector: 'h1',
    groupOffset: {
      delayTime: 300
    }
  },
  loop: {
    count: 2,
    endTime: '00:05.000'
  }
});

const mainBlock = new AnimationBlock({
  '00:00.000': {
    blocks: [h1Block]
  }
}, {
  defaults: {},
  loop: {}
});

mainBlock.start();
```

## Basic Tutorial

This short tutorial should provide a basic understanding of CSS Animation Blocks by building a simple animation.

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

There are also _"style.css"_ and _"index.js"_ files. That's where we'll place code to animate the _"box"_ element.

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
          'background-red 1s steps(1) normal forwards',
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

At time _"00:00.000"_ we have an _animations_ array containing animation objects. Each animation object:
* Must have one _"elementSelector"_. The _"elementSelector"_ above targets _".box"_ (all elements with the class "box").
* Can (optionally) have one _"cssAnimation"_ array containing CSS animation shorthand strings.
* Can (optionally) have one _"cssTransform"_ object. Object keys should match the transform type, and the values are CSS animation shorthand strings.

The animation block above applies three animations, _"fade-in"_, _"background-red"_ and _"move-down"_. Load the page in a browser and you should see the box fade in, move down and turn red.

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
          'fade-in 1s steps(1) normal forwards',
        ],
        cssTransform: {
          scale: 'scale-down 0s ease normal forwards',
        },
      }
    ]
  },
  '00:02.500': {
    animations: [
      {
        elementSelector: 'h1',
        cssTransform: {
          scale: 'scale-down 3s linear reverse forwards',
          rotate: 'rotate 2s ease normal forwards 1',
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
  '00:03.000': {
    animations: [
      {
        elementSelector: '.box',
        cssTransform: {
          rotate: 'rotate 2s ease normal forwards 1',
        },
      }
    ]
  },
  '00:05.000': {
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
  '00:00.000': {
    blocks: [boxBlock]
  }
},{
  defaults: {},
  loop: {}
});
```

### Defaults
When an entire Animation Block targets a single _"elementSelector"_ and/or _"groupOffset"_, it can be tedious to enter the same _"elementSelector"_ and/or _"groupOffset"_ in each time entry. That's where the _"defaults"_ config settings can help.

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
  '00:03.000': {
    animations: [
      {
        cssTransform: {
          rotate: 'rotate 2s ease normal forwards 1',
        },
      }
    ]
  },
  '00:05.000': {
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

You can also set a default _"groupOffset"_ that will apply to all animations in the current Animation Block. Here's the _"boxBlock"_ Animation Block with a Default Group Offset config setting added.

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
  '00:03.000': {
    animations: [
      {
        cssTransform: {
          rotate: 'rotate 2s ease normal forwards 1',
        },
      }
    ]
  },
  '00:05.000': {
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

#### Loop

Another config setting is _"Loop"_. You can use this to run an Animation Block more than once. The possible settings are _"count"_, _"infinite"_, and _"endTime"_.

The settings _"count"_ and _"infinite"_ are both ways to set the number of times an animation will play." A loop _"count"_ of "2" means the animation will play twice, or setting _"infinite"_ to "true" means the animation will play continuously. You only need one of these settings, either _"count"_ or _"infinite"_.

The _"endTime"_ setting is the time the current animation loop ends and the next loop can begin. The _"endTime"_ can be higher than the highest time in the Animation Block, adding a gap/pause at the end of the loop. The _"endTime"_ can also be lower than the highest time in an Animation Block, causing only part of the animation to play.

Here we add the _"loop"_ config to the "mainBlock" Animation Block. The animation will play twice and each loop will run for 7.5 seconds.

```JavaScript
const mainBlock = new AnimationBlock({
  '00:00.000': {
    blocks: [boxBlock]
  }
},{
  loop: {
    count: 2,
    endTime: '00:07.500',
  },
});
```

Here's the same animation with _"loop.infinite"_. This animation will run continuously.

```JavaScript
const mainBlock = new AnimationBlock({
  '00:00.000': {
    blocks: [boxBlock]
  }
},{
  loop: {
    infinte: true,
    endTime: '00:07.500',
  },
});
```

Nested blocks can be looped independently from the main block. The only limitation, is that the number of loops in nested blocks can't exceed the time length of the main block. So, if you created an infinite loop in a nested block, it would only run until is hit the _"endTime"_ of the main block. In the example above, that would be 7.5 seconds.

To illustrate, let's set a short, infinite loop on our "titleBock". As you'll see, the animation will only run until it hits the end of the main block.

```JavaScript
const titleBlock = new AnimationBlock({
  '00:00.000': {
    animations: [
      {
        cssAnimation: [
          'fade-in 1s steps(1) normal forwards',
        ],
        cssTransform: {
          scale: 'scale-down 0s ease normal forwards',
        },
      }
    ]
  },
  '00:02.500': {
    animations: [
      {
        cssTransform: {
          scale: 'scale-down 3s linear reverse forwards',
          rotate: 'rotate 2s ease normal forwards 1',
        },
      }
    ]
  },
},{
  loop: {
    endTime: '00:02.000',
    infinite: true
  },
  defaults: {
    elementSelector: 'h1',
    groupOffset: {
      delayTime: 300
    }
  }
});
```
