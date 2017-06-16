const compute = require('./compute')


describe('function computeTokens', () => {
  const computeTokens = compute.computeTokens
  const testComputeTokens = tester.bind(compute.computeTokens)

  test('returns a number', () =>
    expect(typeof computeTokens([])).toBe('number'))

  describe('empty tokens array returns 0', () =>
    testComputeTokens([], 0))

  describe('single number token returns representing number', () => {
    testComputeTokens(['1'], 1)
    testComputeTokens(['42'], 42)
    testComputeTokens(['1337'], 1337)
    testComputeTokens(['-1'], -1)
  })

  describe('given two number tokens separated by "operation" token', () => {
    describe('"+" operation token returns sum', () => {
      testComputeTokens(['1', '+', '2'], 3)
      testComputeTokens(['1', '+', '3'], 4)
      testComputeTokens(['42', '+', '0'], 42)
    })

    describe('"-" operation token returns difference', () => {
      testComputeTokens(['2', '-', '1'], 1)
      testComputeTokens(['42', '-', '-1'], 43)
      testComputeTokens(['555', '-', '555'], 0)
    })

    describe('"*" operation token returns product', () => {
      testComputeTokens(['2', '*', '2'], 4)
      testComputeTokens(['2', '*', '3'], 6)
      testComputeTokens(['6', '*', '7'], 42)
    })

    describe('"/" operation token returns fraction', () => {
      testComputeTokens(['6', '/', '2'], 3)
      testComputeTokens(['42', '/', '6'], 7)
      testComputeTokens(['100', '/', '-25'], -4)
    })
  })

  describe('given arbitrary number tokens separated by "operation" tokens', () => {
    testComputeTokens(['1', '+', '1', '+', '1'], 3)
    testComputeTokens(['1', '+', '2', '+', '3'], 6)
    testComputeTokens(['5', '+', '10', '/', '3'], 5)
    testComputeTokens(['7', '*', '6', '/', '3'], 14)
  })

  describe('given tokens array where last token is operation', () => {
    testComputeTokens(['1', '+'], 1)
    testComputeTokens(['1', '+', '1', '+'], 2)
    testComputeTokens(['2', '*', '3', '+'], 6)
  })
})


describe('function addOperationToken', () => {
  const testAddOperationToken = tester.bind(compute.addOperationToken)
  const testAddOperationTokenNotChanged = (t, ts) => testAddOperationToken(t, ts, ts)

  describe('given empty tokens array', () => {
    testAddOperationTokenNotChanged('+', [])
    testAddOperationTokenNotChanged('-', [])
    testAddOperationTokenNotChanged('/', [])
    testAddOperationTokenNotChanged('*', [])
  })

  describe('given not empty tokens array', () => {
    testAddOperationToken('+', ['1'], ['1', '+'])
    testAddOperationToken('-', ['2'], ['2', '-'])
    testAddOperationToken('*', ['3.14'], ['3.14', '*'])
    testAddOperationToken('/', ['42'], ['42', '/'])

    testAddOperationTokenNotChanged('+', ['1', '+'])
    testAddOperationTokenNotChanged('+', ['42', '*'])
  })
})


describe('function addNumberToken', () => {
  const testAddNumberToken = tester.bind(compute.addNumberToken)
  const testAddNumberTokenNotChanged = (t, ts) => testAddNumberToken(t, ts, ts)

  describe('empty tokens array accepts any number tokens', () => {
    testAddNumberToken('0', [], ['0'])
    testAddNumberToken('1', [], ['1'])
    testAddNumberToken('2', [], ['2'])
    testAddNumberToken('3', [], ['3'])
    testAddNumberToken('4', [], ['4'])
    testAddNumberToken('5', [], ['5'])
    testAddNumberToken('6', [], ['6'])
    testAddNumberToken('7', [], ['7'])
    testAddNumberToken('8', [], ['8'])
    testAddNumberToken('9', [], ['9'])
  })

  describe('given not empty tokens array', () => {
    describe('given last token is "0" number', () => {
      testAddNumberToken('1', ['0'], ['1'])
      testAddNumberToken('1', ['1', '+', '0'], ['1', '+', '1'])
    })

    describe('given last token is not "0" number', () => {
      testAddNumberToken('1', ['1'], ['11'])
      testAddNumberToken('1', ['2'], ['21'])
      testAddNumberToken('1', ['1', '1'], ['1', '11'])
      testAddNumberToken('1', ['1', '+', '1'], ['1', '+', '11'])
    })

    describe('given last token is not a number', () => {
      testAddNumberToken('1', ['1', '+'], ['1', '+', '1'])
      testAddNumberToken('13.1', ['42', '/'], ['42', '/', '13.1'])
    })
  })
})


describe('function undo', () => {
  const testUndo = tester.bind(compute.undo)

  testUndo([], [])
  testUndo(['1'], [])
  testUndo(['1', '+'], ['1'])
  testUndo(['1', '+', '1'], ['1', '+'])

  testUndo(['11'], ['1'])
  testUndo(['0.11'], ['0.1'])
  testUndo(['0.'], [])

  testUndo(['-1'], [])
})


describe('function addDot', () => {
  const testAddDot = tester.bind(compute.addDot)
  const testAddDotNotChanged = ts => testAddDot(ts, ts)

  testAddDot([], ['0.'])
  testAddDot(['0'], ['0.'])
  testAddDot(['1', '+'], ['1', '+', '0.'])

  testAddDotNotChanged(['0.'])
  testAddDotNotChanged(['0.1'])
})


describe('function flipSign', () => {
  const testFlipSign = tester.bind(compute.flipSign)
  const testFlipSignNotChanged = ts => testFlipSign(ts, ts)

  testFlipSign(['-1'], ['1'])
  testFlipSign(['1'], ['-1'])
  testFlipSign(['0.1'], ['-0.1'])

  testFlipSignNotChanged([])
  testFlipSignNotChanged(['0'])
  testFlipSignNotChanged(['0.'])
  testFlipSignNotChanged(['1', '+'])
})


function tester(...input) {
  pipe([input.slice(0, -1), input[input.length - 1]], ([args, expected]) =>
    test(`${this.name}(${examine(args)}) is ${examine(expected)}`, () =>
      expect(this(...args)).toEqual(expected)))
}


function examine(x) {
  return Array.isArray(x) ? x.map(x => Array.isArray(x) ? `[${examine(x)}]` : `${examine(x)}`).toString() :
    typeof x === 'string' ? `"${x}"` :
    `${x}`
}

function pipe(x, f, ...fs) { return f ? pipe(f(x), ...fs) : x }
