'use strict';

const assert = require('assert');
const helper = require('./test-helper');
const Uuid = require('../index').Uuid;
const TimeUuid = require('../index').TimeUuid;

describe('Uuid', () => {
    describe('constructor', () => {
        it('should validate the Buffer length', () => {
            assert.throws(() => {
                return new Uuid(Buffer.allocUnsafe(10));
            });
            assert.throws(() => {
                return new Uuid(null);
            });
            assert.throws(() => {
                return new Uuid();
            });
            assert.doesNotThrow(() => {
                return new Uuid(Buffer.allocUnsafe(16));
            });
        });
    });
    describe('#toString()', () => {
        it('should convert to string representation', () => {
            let val = new Uuid(Buffer.from('aabbccddeeff00112233445566778899', 'hex'));
            assert.strictEqual(val.toString(), 'aabbccdd-eeff-0011-2233-445566778899');
            val = new Uuid(Buffer.from('a1b1ccddeeff00112233445566778899', 'hex'));
            assert.strictEqual(val.toString(), 'a1b1ccdd-eeff-0011-2233-445566778899');
            val = new Uuid(Buffer.from('ffb1ccddeeff00112233445566778800', 'hex'));
            assert.strictEqual(val.toString(), 'ffb1ccdd-eeff-0011-2233-445566778800');
        });
    });
    describe('#equals', () => {
        it('should return true only when the values are equal', () => {
            const val = new Uuid(Buffer.from('aabbccddeeff00112233445566778899', 'hex'));
            const val2 = new Uuid(Buffer.from('ffffffffffff00000000000000000000', 'hex'));
            const val3 = new Uuid(Buffer.from('ffffffffffff00000000000000000001', 'hex'));
            assert.strictEqual(val.equals(val), true);
            assert.strictEqual(val.equals(new Uuid(
                Buffer.from('aabbccddeeff00112233445566778899', 'hex'))), true
            );
            assert.strictEqual(val.equals(val2), false);
            assert.strictEqual(val.equals(val3), false);
            assert.strictEqual(val2.equals(val3), false);
            assert.strictEqual(val3.equals(val2), false);
        });
    });
    describe('#getBuffer()', () => {
        it('should return the Buffer representation', () => {
            let buf = Buffer.allocUnsafe(16);
            let val = new Uuid(buf);
            assert.strictEqual(val.getBuffer().toString('hex'), buf.toString('hex'));
            buf = Buffer.from('ffffccddeeff00222233445566778813', 'hex');
            val = new Uuid(buf);
            assert.strictEqual(val.getBuffer().toString('hex'), buf.toString('hex'));
        });
    });
    describe('fromString()', () => {
        it('should validate that the string', () => {
            assert.throws(() => {
                Uuid.fromString('22');
            });
            assert.throws(() => {
                Uuid.fromString(null);
            });
            assert.throws(() => {
                Uuid.fromString();
            });
            assert.throws(() => {
                Uuid.fromString('zzb1ccdd-eeff-0011-2233-445566778800');
            });
            assert.doesNotThrow(() => {
                Uuid.fromString('acb1ccdd-eeff-0011-2233-445566778813');
            });
        });
        it('should contain a valid internal representation', () => {
            let val = Uuid.fromString('acb1ccdd-eeff-0011-2233-445566778813');
            assert.strictEqual(val.buffer.toString('hex'), 'acb1ccddeeff00112233445566778813');
            val = Uuid.fromString('ffffccdd-eeff-0022-2233-445566778813');
            assert.strictEqual(val.buffer.toString('hex'), 'ffffccddeeff00222233445566778813');
        });
    });
    describe('random()', function() {
        this.timeout(20000);
        it('should return a Uuid instance', () => {
            helper.assertInstanceOf(Uuid.random(), Uuid);
        });
        it('should contain the version bits and IETF variant', () => {
            let val = Uuid.random();
            assert.strictEqual(val.toString().charAt(14), '4');
            assert.ok(['8', '9', 'a', 'b'].indexOf(val.toString().charAt(19)) >= 0);
            val = Uuid.random();
            assert.strictEqual(val.toString().charAt(14), '4');
            assert.ok(['8', '9', 'a', 'b'].indexOf(val.toString().charAt(19)) >= 0);
            val = Uuid.random();
            assert.strictEqual(val.toString().charAt(14), '4');
            assert.ok(['8', '9', 'a', 'b'].indexOf(val.toString().charAt(19)) >= 0);
        });
        it('should generate v4 uuids that do not collide', () => {
            const values = {};
            const length = 100000;
            for (let i = 0; i < length; i++) {
                values[Uuid.random().toString()] = true;
            }
            assert.strictEqual(Object.keys(values).length, length);
        });
    });

    describe('random(cb)', function() {
        this.timeout(20000);
        it('should return a Uuid instance', (done) => {
            Uuid.random((err, uuid) => {
                if (err) {
                    done(err);
                }
                helper.assertInstanceOf(uuid, Uuid);
                done();
            });

        });
        it('should contain the version bits and IETF variant', (done) => {
            Uuid.random((err, val) => {
                if (err) {
                    done(err);
                }
                assert.strictEqual(val.toString().charAt(14), '4');
                assert.ok(['8', '9', 'a', 'b'].indexOf(val.toString().charAt(19)) >= 0);
                Uuid.random((err, val) => {
                    if (err) {
                        done(err);
                    }
                    assert.strictEqual(val.toString().charAt(14), '4');
                    assert.ok(['8', '9', 'a', 'b'].indexOf(val.toString().charAt(19)) >= 0);
                    Uuid.random((err, val) => {
                        if (err) {
                            done(err);
                        }
                        assert.strictEqual(val.toString().charAt(14), '4');
                        assert.ok(['8', '9', 'a', 'b'].indexOf(val.toString().charAt(19)) >= 0);
                        done();
                    });
                });
            });
        });
        it('should generate v4 uuids that do not collide', (done) => {
            const values = {};
            const length = 100000;

            helper.times(length, (n, next) => {
                Uuid.random((err, val) => {
                    if (err) {
                        return next(err);
                    }
                    values[val.toString()] = true;
                    next();
                });
            }, (err) => {
                assert.ifError(err);
                assert.strictEqual(Object.keys(values).length, length);
                done();
            });
        });
    });
});
describe('TimeUuid', () => {
    describe('constructor()', () => {
        it('should generate based on the parameters', () => {
            // Gregorian calendar epoch
            let val = new TimeUuid(new Date(-12219292800000), 0,
                Buffer.from([0,0,0,0,0,0]), Buffer.from([0,0]));
            assert.strictEqual(val.toString(), '00000000-0000-1000-8000-000000000000');
            val = new TimeUuid(new Date(-12219292800000 + 1000), 0,
                Buffer.from([0,0,0,0,0,0]), Buffer.from([0,0]));
            assert.strictEqual(val.toString(), '00989680-0000-1000-8000-000000000000');
            // unix  epoch
            val = new TimeUuid(new Date(0), 0, Buffer.from([0,0,0,0,0,0]), Buffer.from([0,0]));
            assert.strictEqual(val.toString(), '13814000-1dd2-11b2-8000-000000000000');
            val = new TimeUuid(new Date(0), 0, Buffer.from([255,255,255,255,255,255]),
                Buffer.from([255,255]));
            assert.strictEqual(val.toString(), '13814000-1dd2-11b2-bfff-ffffffffffff');
            val = new TimeUuid(new Date(0), 0, Buffer.from([1,1,1,1,1,1]), Buffer.from([1,1]));
            assert.strictEqual(val.toString(), '13814000-1dd2-11b2-8101-010101010101');

            val = new TimeUuid(new Date('2015-01-10 5:05:05 GMT+0000'), 0,
                Buffer.from([1,1,1,1,1,1]), Buffer.from([1,1]));
            assert.strictEqual(val.toString(), '3d555680-9886-11e4-8101-010101010101');
        });
    });
    describe('#getDatePrecision()', () => {
        it('should get the Date and ticks of the Uuid representation', () => {
            let date = new Date();
            let val = new TimeUuid(date, 1);
            assert.strictEqual(val.getDatePrecision().ticks, 1);
            assert.strictEqual(val.getDatePrecision().date.getTime(), date.getTime());

            date = new Date('2015-02-13 06:07:08.450');
            val = new TimeUuid(date, 699);
            assert.strictEqual(val.getDatePrecision().ticks, 699);
            assert.strictEqual(val.getDatePrecision().date.getTime(), date.getTime());
            assert.strictEqual(val.getDate().getTime(), date.getTime());
        });
    });
    describe('#getNodeId()', () => {
        it('should get the node id of the Uuid representation', () => {
            let val = new TimeUuid(new Date(), 0, Buffer.from([1, 2, 3, 4, 5, 6]));
            helper.assertInstanceOf(val.getNodeId(), Buffer);
            assert.strictEqual(val.getNodeId().toString('hex'), '010203040506');
            val = new TimeUuid(new Date(), 0, 'host01');
            assert.strictEqual(val.getNodeIdString(), 'host01');
            val = new TimeUuid(new Date(), 0, 'h12288');
            assert.strictEqual(val.getNodeIdString(), 'h12288');
        });
    });
    describe('fromDate()', function() {
        this.timeout(5000);
        it('should generate v1 uuids that do not collide', () => {
            const values = {};
            const length = 50000;
            const date = new Date();
            for (let i = 0; i < length; i++) {
                values[TimeUuid.fromDate(date).toString()] = true;
            }
            assert.strictEqual(Object.keys(values).length, length);
        });
        it('should collide exactly at 10001 if date but not the ticks are specified', () => {
            const values = {};
            const length = 10000;
            const date = new Date();
            for (let i = 0; i < length; i++) {
                values[TimeUuid.fromDate(date, null, 'host01', 'AA').toString()] = true;
            }
            assert.strictEqual(Object.keys(values).length, length);
            // next should collide
            assert.strictEqual(values[
                TimeUuid.fromDate(date, null, 'host01', 'AA').toString()
            ], true);
        });
    });
    describe('fromString()', () => {
        it('should parse the string representation', () => {
            const text = '3d555680-9886-11e4-8101-010101010101';
            const val = TimeUuid.fromString(text);
            helper.assertInstanceOf(val, TimeUuid);
            assert.strictEqual(val.toString(), text);
            assert.strictEqual(val.getDate().getTime(),
                new Date('2015-01-10 5:05:05 GMT+0000').getTime());
        });
    });
    describe('now()', () => {
        it('should pass the nodeId when provided', () => {
            const val = TimeUuid.now('h12345');
            assert.strictEqual(val.getNodeIdString(), 'h12345');
        });
        it('should use current date', () => {
            const startDate = new Date().getTime();
            const val = TimeUuid.now().getDate().getTime();
            const endDate = new Date().getTime();
            assert.ok(val >= startDate);
            assert.ok(val <= endDate);
        });
        it('should reset the ticks portion of the TimeUuid to zero when the time progresses',
            () => {
                const firstTimeUuid = TimeUuid.now();
                let secondTimeUuid = TimeUuid.now();
                while (firstTimeUuid.getDate().getTime() === secondTimeUuid.getDate().getTime()) {
                    secondTimeUuid = TimeUuid.now();
                }
                assert.strictEqual(secondTimeUuid.getDatePrecision().ticks, 0);
            });
    });
    describe('min()', () => {
        it('should generate uuid with the minimum node and clock id values', () => {
            const val = TimeUuid.min(new Date());
            assert.strictEqual(val.getNodeId().toString('hex'), '808080808080');
        });
    });
    describe('max()', () => {
        it('should generate uuid with the maximum node and clock id values', () => {
            const val = TimeUuid.max(new Date());
            assert.strictEqual(val.getNodeId().toString('hex'), '7f7f7f7f7f7f');
        });
    });
});
