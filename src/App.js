// @flow
import React, { PropTypes } from 'react'
import { createReducer } from 'redux-fly'
import styled, { keyframes } from 'styled-components'

const increment = reduxSetState => reduxSetState('INCREMENT',
  state => ({ value: state.value + 1 }))

const decrement = reduxSetState => reduxSetState('DECREMENT',
  state => ({ value: state.value - 1 }))

const incrementIfOdd = (counter, reduxSetState) => {
  if (counter % 2 !== 0) {
    increment(reduxSetState)
  }
}

const incrementAsync = reduxSetState => {
  setTimeout(() => increment(reduxSetState), 1000)
}

const appLogoSpin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const Logo = styled.img`
  animation: ${appLogoSpin} infinite 20s linear;
  height: 40px;
`

const Counter = ({ reduxState: { value: counter }, reduxSetState }) => (
  <div>
    <p>
      <Logo src={(process.env.PUBLIC_URL: any) + '/logo.svg'} className="App-logo" alt="logo" />
      Clicked: {counter} times
      {' '}
      <button onClick={() => increment(reduxSetState)}>
        +
      </button>
      {' '}
      <button onClick={() => decrement(reduxSetState)}>
        -
      </button>
      {' '}
      <button onClick={() => incrementIfOdd(counter, reduxSetState)}>
        Increment if odd
      </button>
      {' '}
      <button onClick={() => incrementAsync(reduxSetState)}>
        Increment async
      </button>
    </p>
  </div>
)

Counter.propTypes = {
  reduxState: PropTypes.object.isRequired,
  reduxSetState: PropTypes.func.isRequired
}

export default createReducer({
  mountPath: 'counter',
  initialState: {
    value: 0
  }
})(Counter)
