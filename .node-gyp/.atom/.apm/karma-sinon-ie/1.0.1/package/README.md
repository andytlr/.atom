karma-sinon-ie
==============

Sinon for karma, includes `sinon-ie` for IE compatiblity.

**Example**
```javascript
describe("sinon example test", function () {
    var time2013_10_01;

    time2013_10_01 = (new Date(2013, 10-1, 1)).getTime();

    before(function() {
        // sinon was defined in global scope
        this.fakeTimer = new sinon.useFakeTimers(time2013_10_01);
    });

    it("some test", function() {
        //test
    });

    after(function() {
        this.fakeTimer.restore();
    });

});
```
