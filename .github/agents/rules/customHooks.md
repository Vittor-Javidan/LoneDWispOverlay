- custom hooks must always follow the archtecture bellow:

`
function useExampleHook(o: {
  props: propType
  propCallback: (propType) => void
})
`

and its usage like:

`
useExampleHook({
  props: dataWithPropType
  propCallback: (dataReturnedFromCallback) => { ... }
})
`