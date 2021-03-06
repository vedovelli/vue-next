import {
  h,
  ref,
  render,
  nodeOps,
  nextTick,
  defineComponent
} from '@vue/runtime-test'
import { mockWarn } from '@vue/shared'

describe('renderer: component', () => {
  mockWarn()

  test.todo('should work')

  test.todo('shouldUpdateComponent')

  test.todo('componentProxy')

  describe('componentProps', () => {
    test.todo('should work')

    test('should convert empty booleans to true', () => {
      let b1: any, b2: any, b3: any

      const Comp = defineComponent({
        props: {
          b1: Boolean,
          b2: [Boolean, String],
          b3: [String, Boolean]
        },
        setup(props) {
          ;({ b1, b2, b3 } = props)
          return () => ''
        }
      })

      render(
        h(Comp, <any>{ b1: '', b2: '', b3: '' }),
        nodeOps.createElement('div')
      )

      expect(b1).toBe(true)
      expect(b2).toBe(true)
      expect(b3).toBe('')
      expect('type check failed for prop "b1"').toHaveBeenWarned()
    })
  })

  describe('slots', () => {
    test('should respect $stable flag', async () => {
      const flag1 = ref(1)
      const flag2 = ref(2)
      const spy = jest.fn()

      const Child = () => {
        spy()
        return 'child'
      }

      const App = {
        setup() {
          return () => [
            flag1.value,
            h(
              Child,
              { n: flag2.value },
              {
                foo: () => 'foo',
                $stable: true
              }
            )
          ]
        }
      }

      render(h(App), nodeOps.createElement('div'))
      expect(spy).toHaveBeenCalledTimes(1)

      // parent re-render, props didn't change, slots are stable
      // -> child should not update
      flag1.value++
      await nextTick()
      expect(spy).toHaveBeenCalledTimes(1)

      // parent re-render, props changed
      // -> child should update
      flag2.value++
      await nextTick()
      expect(spy).toHaveBeenCalledTimes(2)
    })
  })

  test('emit', async () => {
    let noMatchEmitResult: any
    let singleEmitResult: any
    let multiEmitResult: any

    const Child = defineComponent({
      setup(_, { emit }) {
        noMatchEmitResult = emit('foo')
        singleEmitResult = emit('bar')
        multiEmitResult = emit('baz')
        return () => h('div')
      }
    })

    const App = {
      setup() {
        return () =>
          h(Child, {
            // emit triggering single handler
            onBar: () => 1,
            // emit triggering multiple handlers
            onBaz: [() => Promise.resolve(2), () => Promise.resolve(3)]
          })
      }
    }

    render(h(App), nodeOps.createElement('div'))

    // assert return values from emit
    expect(noMatchEmitResult).toMatchObject([])
    expect(singleEmitResult).toMatchObject([1])
    expect(await Promise.all(multiEmitResult)).toMatchObject([2, 3])
  })

  // for v-model:foo-bar usage in DOM templates
  test('emit update:xxx events should trigger kebab-case equivalent', () => {
    const Child = defineComponent({
      setup(_, { emit }) {
        emit('update:fooBar', 1)
        return () => h('div')
      }
    })

    const handler = jest.fn()
    const App = {
      setup() {
        return () =>
          h(Child, {
            'onUpdate:foo-bar': handler
          })
      }
    }

    render(h(App), nodeOps.createElement('div'))
    expect(handler).toHaveBeenCalled()
  })
})
