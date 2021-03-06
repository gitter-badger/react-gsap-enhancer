import React, {Children, isValidElement} from 'react'

export default function attachRefs(element, itemMap, idx = 0) {
  var {key, ref: previousRef} = element
  if (key === null) {
    key = idx
  }

  if (typeof previousRef === 'string') {
    throw Error('Cannot connect GSAP Enhancer to an element with an existing string ref. ' +
    'Please convert it to use a callback ref instead, or wrap it into a <span> or <div>. ' +
    'Read more: https://facebook.github.io/react/docs/more-about-refs.html#the-ref-callback-attribute')
  }

  var item
  if (itemMap.has(key)) {
    item = itemMap.get(key)
  }
  else {
    item = itemMap.set(key, {
      children: new Map(),
    }).get(key)
  }

  if (!item.ref) {
    item.ref = (component) => {
      var node = React.findDOMNode(component)
      item.component = component
      item.node = node

      if (typeof previousRef === 'function') {
        previousRef(component)
      }
    }
  }

  const originalChildren = element.props.children
  let children
  if (typeof originalChildren !== 'object') {
    children = originalChildren
  }
  else if (isValidElement(originalChildren)) {
    children = cloneChild(originalChildren)
  }
  else {
    children = Children.map(originalChildren, (child, childIdx) => {
      return cloneChild(child, childIdx)
    })
  }

  function cloneChild(child, childIdx) {
    if (React.isValidElement(child)) {
      return attachRefs(child, item.children, childIdx)
    }
    else {
      return child
    }
  }

  return React.cloneElement(element, {ref: item.ref, children})
}
