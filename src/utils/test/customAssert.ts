import { expect } from '@jest/globals';

export default class CustomAssert {
  static async throwsAsync(codeUnderTest: () => void): Promise<Error> {
    let err: Error | undefined;
    try {
      await codeUnderTest();
    } catch (error) {
      err = error as any;
    }
    if (!err) throw new Error("Expected error to be thrown, but it wasn't");
    return err;
  }

  static deepEqualNoOrder(
    actual: any,
    expected: any,
    message = 'Deep Equal comparison failed',
    path = '',
  ): void {
    if (checkIsArrayLike(expected)) {
      return deepEqualNoOrderForArray(actual, expected, message, path);
    } else if (typeof expected === 'object') {
      return deepEqualNoOrderForObject(actual, expected, message, path);
    } else {
      try {
        expect(actual).toBe(expected);
      } catch (error) {
        throw new Error(message + `\n\t at path: '${path}'.\n` + error.stack);
      }
    }
  }
}

function checkIsArrayLike(obj: any): boolean {
  if (obj === null || obj === undefined) return false;
  if (typeof obj != 'object') return false;
  if (Array.isArray(obj)) return true;
  else if (typeof obj.length === 'number') {
    if (obj.length < 0) return false;
    for (let i = 0; i < obj.length; i++) {
      if (!Object.prototype.hasOwnProperty.call(obj, i)) return false;
    }
    return true;
  } else return false;
}

function toArray(arr: any): any[] {
  return [...Array(arr.length).keys()].map((i) => arr[i]);
}

function deepEqualNoOrderForArray(
  actualArr: any,
  expectedArr: any[],
  message: string,
  path: string,
): void {
  if (!checkIsArrayLike(actualArr)) {
    try {
      return expect(actualArr).toEqual(expectedArr); // will fail
    } catch (error) {
      throw new Error(message + `\n\t at path: '${path}'` + error.stack);
    }
  }
  const actualSorted = toArray(actualArr)
    .map((i: any) => JSON.stringify(i))
    .sort()
    .map((i: any) => JSON.parse(i));
  const expectedSorted = toArray(expectedArr)
    .map((i: any) => JSON.stringify(i))
    .sort()
    .map((i: any) => JSON.parse(i));

  if (actualSorted.length !== expectedSorted.length) {
    try {
      return expect(actualArr).toEqual(expectedArr); // will fail
    } catch (error) {
      throw new Error(message + `\n\t at path: '${path}'` + error.stack);
    }
  }

  for (let i = 0; i < actualSorted.length; i++) {
    CustomAssert.deepEqualNoOrder(
      actualSorted[i],
      expectedSorted[i],
      message,
      path + `[${i}]`,
    );
  }
}

function deepEqualNoOrderForObject(
  actualObj: any,
  expectedObj: { [key: string]: any },
  message: string,
  path: string,
): void {
  if (actualObj === null && expectedObj === null) return;
  else if (actualObj === null || expectedObj === null) {
    try {
      return expect(actualObj).toEqual(expectedObj);
    } catch (error) {
      throw new Error(message + `\n\t at path: '${path}'` + error.stack);
    }
  }

  if (Array.isArray(actualObj)) {
    try {
      return expect(actualObj).toEqual(expectedObj); // will fail
    } catch (error) {
      throw new Error(message + `\n\t at path: '${path}'` + error.stack);
    }
  }
  if (typeof actualObj !== 'object') {
    try {
      return expect(actualObj).toEqual(expectedObj); // will fail
    } catch (error) {
      throw new Error(message + `\n\t at path: '${path}'` + error.stack);
    }
  }

  try {
    expect(Object.keys(actualObj).sort()).toEqual(
      Object.keys(expectedObj).sort(),
    );
  } catch (error) {
    throw new Error(
      message +
        `\nKeys do not match.` +
        `\n\t\t At path: '${path}'` +
        `\n\n\t - Expected: ${JSON.stringify(expectedObj)}` +
        `\n\n\t - Actual: ${JSON.stringify(actualObj)}\n` +
        error.stack,
    );
  }

  for (const key in expectedObj) {
    CustomAssert.deepEqualNoOrder(
      actualObj[key],
      expectedObj[key],
      message,
      path + `.${key}`,
    );
  }
}
