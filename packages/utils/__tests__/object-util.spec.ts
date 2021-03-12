import * as objectUtil from '../object-util';

const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

describe('object-util', () => {

    beforeEach(() => {
        consoleSpy.mockClear();
    });

    describe('setPropertyByPath 根據路徑設定屬性', () => {
        let testObj: any = {
            aa: 20
        };
        test('正確設定', () => {
            objectUtil.setPropertyByPath(testObj, 'a.b.c', 10);
            expect(testObj.a.b.c).toBe(10);
        });
        test('路徑中有非物件屬性', () => {
            objectUtil.setPropertyByPath(testObj, 'aa.b.c', 20);
            expect(consoleSpy).toHaveBeenCalledTimes(1);
        });
        test('path傳空值', () => {
            objectUtil.setPropertyByPath(testObj, '', 10);
            expect(consoleSpy).toHaveBeenCalledTimes(1);
        });
    });
    describe('getPropertyByPath 取屬性的目標', () => {
        let testObj: any = {
            a: {
                b: {
                    c: 1
                }
            },
            b: {
                c: 'd'
            }
        };

        test('取存在的屬性', () => {
            const test = objectUtil.getPropertyByPath(testObj, 'a.b.c');
            expect(test).toBe(1);
        });
        test('取不存在的屬性', () => {
            const test = objectUtil.getPropertyByPath(testObj, 'b.c.d');
            expect(test).toBeUndefined;
        });
    });
    describe('objHasProperty 檢查物件是否擁有某個key', () => {
        const testObj = {
            a: 1,
            b: 2
        };

        test('檢查存在', () => {
            expect(objectUtil.objHasProperty(testObj, 'a')).toBe(true);
        });
        test('檢查不存在', () => {
            expect(objectUtil.objHasProperty(testObj, 'c')).toBe(false);
        });
    });
    describe('dataIsSet 檢查是否非空物件', () => {
        test('檢查是空物件', () => {
            expect(objectUtil.dataIsSet({})).toBe(false);
        });
        test('檢查非空物件', () => {
            expect(objectUtil.dataIsSet({ foo: 'bar' })).toBe(true);
        });
    });
    describe('isTwoLayArray 檢查是否為兩層或以上的陣列', () => {
        test('一層', () => {
            expect(objectUtil.isTwoLayArray([])).toBe(false);
        });
        test('兩層', () => {
            expect(objectUtil.isTwoLayArray([[]])).toBe(true);
        });
        test('三層', () => {
            expect(objectUtil.isTwoLayArray([[[]]])).toBe(true);
        });
    });
    describe('jsonArrayCovert JSON字串轉換成陣列', () => {
        test('轉換成功', () => {
            const testObject: any = objectUtil.jsonArrayCovert('[{ "foo": "bar" }]');
            expect(testObject[0].foo).toBe('bar');
        });
        test('轉換失敗', () => {
            const testObject: any = objectUtil.jsonArrayCovert('abc123');
            expect(consoleSpy).toHaveBeenCalledTimes(1);
            expect(testObject).toHaveLength(0);
        });
    });
    describe('zeroValueObject 將物件所有屬性設定為zeroValue', () => {
        test('轉換多層物件', () => {
            const date = new Date();
            const testObject = objectUtil.zeroValueObject({
                a: 1,
                b: 'a',
                c: true,
                d: {
                    da: 2,
                    db: 'b',
                    dc: false
                },
                e: date
            });

            expect(testObject.a).toBe(0);
            expect(testObject.b).toBe('');
            expect(testObject.c).toBe(false);
            expect(testObject.d.da).toBe(0);
            expect(testObject.d.db).toBe('');
            expect(testObject.d.dc).toBe(false);
            expect(testObject.e.getTime()).toBe(date.getTime());
        });
    });
    describe('checkZeroObject 測試物件裡所有key的值都是zeroValue', () => {
        test('測試通過', () => {
            const testObject = {
                a: 0,
                b: '',
                c: false,
                d: {
                    da: 0,
                    db: '',
                    dc: false
                }
            };
            expect(objectUtil.checkZeroObject(testObject)).toBe(true);
        });
        test('測試不通過', () => {
            const testObject = {
                a: 1,
                b: '',
                c: false
            };
            expect(objectUtil.checkZeroObject(testObject)).toBe(false);
        });
        test('傳入excludeKey跳過不符合的值', () => {
            const testObject = {
                a: 1,
                b: '',
                c: false
            };
            expect(objectUtil.checkZeroObject(testObject, { 'a': true })).toBe(true);
        });
    });
});
