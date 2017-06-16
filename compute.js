const tools = (() => {
  const last = xs => xs[xs.length - 1]
  const pipe = (x, f, ...fs) => f ? pipe(f(x), ...fs) : x
  const changeLastElementTo = (e, xs) => xs.slice(0, -1).concat(e)

  return {
    last: last,
    pipe: pipe,
    changeLastElementTo: changeLastElementTo
  }
})()

const pipe = tools.pipe

const backend = pipe(tools,
  ({ pipe, last, changeLastElementTo }) => {
    const operations = {
      '+': (a, b) => a + b,
      '-': (a, b) => a - b,
      '*': (a, b) => a * b,
      '/': (a, b) => a / b
    }

    const isOperationToken = t => Object.keys(operations).includes(t)


    const computeTokens = ([a, operator, b, ...rest]) =>
      !a ? 0 :
      !b ? Number(a) :
      computeTokens([operations[operator](Number(a), Number(b))].concat(rest))


    const addOperationToken = (t, ts) =>
      ts.length === 0 ? [] :
      pipe(ts, last, isOperationToken) ? ts :
      ts.concat(t)


    const addNumberToken = (t, ts) =>
      ts.length === 0 ? [t] :
      pipe(ts, last, lastToken =>
        isOperationToken(lastToken) ? ts.concat(t) :
        lastToken === '0' ? changeLastElementTo(t, ts) :
        changeLastElementTo(lastToken + t, ts))


    const addDot = ts =>
      ts.length === 0 ? ['0.'] :
      pipe(ts, last, t =>
        isOperationToken(t) ? ts.concat(['0.']) :
        t.includes('.') ? ts :
        changeLastElementTo(t + '.', ts))


    const undo = ts =>
      ts.length === 0 ? [] :
      pipe(ts, last, t => t === '0.' || isOperationToken(t) || t.length === 1 || (t.length === 2 && t[0] === '-') ?
        ts.slice(0, -1) : changeLastElementTo(t.slice(0, -1), ts))


    const flipSign = ts =>
      pipe(ts, last, t =>
        !t || isOperationToken(t) || t === '0' || t === '0.' ?
        ts : changeLastElementTo(pipe(t, Number, x => -x, String), ts))

    return {
      computeTokens: computeTokens,
      addNumberToken: addNumberToken,
      addOperationToken: addOperationToken,
      undo: undo,
      addDot: addDot,
      flipSign: flipSign
    }
  })


const frontend = pipe([tools, backend],
  ([{ pipe, last }, { flipSign, undo, computeTokens, addDot, addNumberToken, addOperationToken }]) => {
    let tokens = ['0']
    const tokenUpdater = func => () => {
      tokens = func(tokens)
      $('.form__secondary')[0].value = tokens.join(' ') || '0'
      $('.form__primary')[0].value = last(tokens) || '0'
    }


    const numberAdder = num =>
      tokenUpdater(addNumberToken.bind(null, num))


    const operationAdder = op =>
      tokenUpdater(addOperationToken.bind(null, op))


    const buttonsData = [
      { id: '0', callback: numberAdder('0') },
      { id: '1', callback: numberAdder('1') },
      { id: '2', callback: numberAdder('2') },
      { id: '3', callback: numberAdder('3') },
      { id: '4', callback: numberAdder('4') },
      { id: '5', callback: numberAdder('5') },
      { id: '6', callback: numberAdder('6') },
      { id: '7', callback: numberAdder('7') },
      { id: '8', callback: numberAdder('8') },
      { id: '9', callback: numberAdder('9') },

      { id: 'add', callback: operationAdder('+') },
      { id: 'substract', callback: operationAdder('-') },
      { id: 'multiply', callback: operationAdder('*') },
      { id: 'divide', callback: operationAdder('/') },

      { id: 'dot', callback: tokenUpdater(addDot) },
      { id: 'undo', callback: tokenUpdater(undo) },
      { id: 'flip-sign', callback: tokenUpdater(flipSign) },
      { id: 'equals', callback: tokenUpdater(ts => pipe(ts, computeTokens, String, x => [x])) },
      { id: 'clear', callback: tokenUpdater(() => ['0']) }
    ]

    const init = () => {
      buttonsData.forEach(({ id, callback }) => $(`#${id}`).click(callback))
      tokenUpdater(() => ['0'])()
    }

    return { init: init }
  })


module.exports = backend
