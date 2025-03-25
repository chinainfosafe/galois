
var calc;
var undostack, state, redostack;
var a2, a6;
var nstack;
var base2;
var currsystem, affine, projective, jacobian, lopezdahab;
function number() {
    this.val = null;
    this.coor = null;
    this.texttoval = texttoval;
    this.valtotext = valtotext;
    this.valtotext();
    this.copy = numbercopy;
    this.push = push;
}
function numbertext(t) {
    var num;

    num = new number();
    num.text = t;
    num.texttoval();
    return (num);
}
function numberval(a) {
    var num;

    num = new number();
    num.val = a;
    num.valtotext();;
    return (num);
}
function numbercopy() {
    var num, i;

    num = new number();
    num.text = this.text;
    num.val = this.val;
    if (num.val) num.val = num.val.slice();
    num.coor = this.coor;
    if (num.coor) {
        num.coor = num.coor.slice();
        for (i = 0; i < num.coor.length; i++)
            num.coor[i] = num.coor[i].copy();
    }
    return (num);
}
function radiosave(d) {
    var s, i;

    s = new Array();
    for (i = 0; i < d.length; i++)
        s.push(d[i].checked);
    return (s);
}
function radiorestore(d, s) {
    var i;

    for (i = 0; i < s.length; i++)
        d[i].checked = s[i];
}
function optionsave(d) {
    var s;

    s = new Object();
    s.text = d.text;
    s.number = d.number == null ? d.number : d.number.copy();
    return (s);
}
function optionrestore(d, s) {
    d.text = s.text;
    d.number = s.number;
}
function selectsave(d) {
    var s, i;

    s = new Object();
    s.selectedIndex = d.selectedIndex;
    s.options = new Array();
    for (i = 0; i < d.options.length; i++)
        s.options.push(optionsave(d.options[i]));
    return (s);
}
function selectrestore(d, s) {
    var i, o;

    for (i = d.options.length; i--; d.remove(i));
    for (i = 0; i < s.options.length; i++) {
        optionrestore(o = new Option(""), s.options[i]);
        d.seladd(o, i);
    }
    d.selectedIndex = s.selectedIndex;
}
function textsave(d) {
    var s;

    s = new Object();
    s.value = d.value;
    s.number = d.number == null ? null : d.number.copy();
    return (s);
}
function textrestore(d, s) {
    d.value = s.value;
    d.number = s.number;
}
function calcsave(d) {
    var s;

    s = new Object();
    s.status = textsave(d.status);
    s.entry = textsave(d.entry);
    s.r = textsave(d.r);
    s.a6 = textsave(d.a6);
    s.a2 = textsave(d.a2);
    s.stack = selectsave(d.stack);
    s.storage = selectsave(d.storage);
    s.base = radiosave(d.base);
    s.system = radiosave(d.system);
    s.nstack = nstack;
    return (s);
}
function calcrestore(d, s) {
    textrestore(d.status, s.status);
    textrestore(d.entry, s.entry);
    textrestore(d.r, s.r);
    textrestore(d.a6, s.a6);
    textrestore(d.a2, s.a2);
    selectrestore(d.stack, s.stack);
    selectrestore(d.storage, s.storage);
    radiorestore(d.base, s.base);
    radiorestore(d.system, s.system);
    nstack = s.nstack;
}
function savestate() {
    if (undostack.length >= 20) undostack.shift();
    undostack.push(state);
    redostack.length = 0;
    state = calcsave(calc);
}
function onundo() {
    if (err(undostack.length > 0 ? null : "Nothing to undo")) return;
    redostack.push(state);
    state = undostack.pop();
    calcrestore(calc, state);
}
function onredo() {
    if (err(redostack.length > 0 ? null : "Nothing to redo")) return;
    undostack.push(state);
    state = redostack.pop();
    calcrestore(calc, state);
}
function seladd(o, n) {
    try {
        this.add(o, n);
    }
    catch (ex) {
        this.add(o, n == this.length ? null : this.options[n]);
    }
}
function newoption(s, num) {
    var o;

    o = new Option(s);
    o.number = num;
    return (o);
}
function init() {
    var blank, pad, i;

    calc = document.gf2mcalc;
    calc.stack.seladd = seladd;
    calc.storage.seladd = seladd;
    calc.base[3].checked = true;
    base2 = 4;
    calc.system[0].checked = true;
    blank = String.fromCharCode(0xA0);
    a = new Array();
    for (i = 0; i < 140; i++) a.push(blank);
    pad = a.join("");
    for (i = 0; i < 3; i++)
        calc.stack.seladd(newoption("", null), i);
    calc.stack.seladd(newoption(pad, null), i);
    calc.stack.selectedIndex = i;
    nstack = 0;
    calc.storage.seladd(newoption(pad, null), 0);
    calc.storage.selectedIndex = 0;
    calc.entry.number = numbertext(calc.entry.value = "");
    calc.r.number = numbertext(calc.r.value = "805");
    calc.a2.number = numbertext(calc.a2.value = "1");
    calc.a6.number = numbertext(calc.a6.value = "1CC");
    initsystem();
    calc.status.number = null;
    err(null);
    undostack = new Array();
    redostack = new Array();
    savestate();
    undostack.length = 0;
}
function texttoval() {
    var n, i, c, d, m;

    this.val = new Array();
    n = 0;
    for (i = this.text.length; i > 0;) {
        c = this.text.charCodeAt(--i);
        if (c >= 48 && c <= 57) d = c - 48;
        else if (c >= 65 && c <= 90) d = c - 65 + 10;
        else if (c >= 97 && c <= 122) d = c - 97 + 10;
        else d = -1;
        for (m = n + base2; n < m; this.val[n++] = d & 1, d >>= 1);
        if (d) return (this.val = null);
    }
    while (n-- && !this.val[n]);
    this.val.length = ++n;
    return (this.val);
}
function valtotext() {
    var a, d, m, i;

    if (!this.val) {
        if (!this.coor)
            return (this.text = String.fromCharCode(0x221E));
        this.text = "(";
        for (i = 0; i < this.coor.length; i++) {
            if (i) this.text += ", ";
            this.text += this.coor[i].valtotext();
        }
        return (this.text += ")");
    }
    if (!this.val.length) return (this.text = "0");
    a = new Array();
    d = 0;
    m = (this.val.length - 1) - (this.val.length - 1) % base2;
    for (i = this.val.length; i > 0;) {
        d <<= 1;
        d |= this.val[--i];
        if (i != m) continue;
        a.push(String.fromCharCode(d < 10 ? d + 48 : d - 10 + 65));
        d = 0;
        m -= base2;
    }
    return (this.text = a.join(""));
}
function onbase2(b2) {
    var o, i;

    calc.entry.number.text = calc.entry.value;
    calc.entry.number.texttoval();
    base2 = b2;
    calc.entry.value = calc.entry.number.valtotext();
    calc.r.value = calc.r.number.valtotext();
    calc.a6.value = calc.a6.number.valtotext();
    o = calc.stack.options;
    for (i = o.length - nstack; i < o.length; i++)
        o[i].text = o[i].number.valtotext();
    o = calc.storage.options;
    for (i = 0; i < o.length - 1; i++)
        o[i].text = o[i].number.valtotext();
    stackselect();
    err(null);
    savestate();
}
function err(s) {
    calc.status.value = s == null ? "OK" : s;
    return (s != null);
}
function storagecheck() {
    if (calc.storage.selectedIndex < 0 ||
        calc.storage.selectedIndex >= calc.storage.length - 1)
        return ("No location selected in storage");
    return (null);
}
function stackcheck(n) {
    if (nstack < n)
        return ("Need at least " + n + " number" +
            (n == 1 ? "" : "s") + " on stack");
    return (null);
}
function selectcheck() {
    if (!nstack)
        return ("Stack empty");
    if (calc.stack.length - calc.stack.selectedIndex > nstack)
        return ("No number selected on stack");
    return (null);
}
function stacknumber(i) {
    return (i >= nstack ? null :
        calc.stack.options[calc.stack.length - 1 - i].number);
}
function scalarcheck(n) {
    var i, s;

    s = calc.stack;
    for (i = 0; i < n; i++)
        if (stacknumber(i) == null || stacknumber(i).val == null) break;
    if (i < n)
        return ("Need at least " + n + " scalar number" +
            (n == 1 ? "" : "s") + " on stack");
    return (null);
}
function onpush(t) {
    if (t == calc.entry) {
        t.number.text = t.value;
        if (t.number.texttoval() == null)
            if (err("Number must consist of " +
                (base2 < 4 ? "0-" : "0-9 or A-") +
                String.fromCharCode((base2 < 4 ? 48 : 65 - 10) +
                    (1 << base2) - 1) + " characters only"))
                return;
        t.number.valtotext();
    }
    else if (t == null)
        if (err(storagecheck())) return;
        else t = calc.storage.options[calc.storage.selectedIndex];
    t.number.push();
    savestate();
}
function onpop(t) {
    var i, o, s;

    if (err(stackcheck(1))) return;
    if (t == null) {
        s = calc.storage;
        if ((i = s.selectedIndex) == s.length - 1)
            s.seladd(newoption("", null), i);
        else if (err(storagecheck())) return;
        o = s.options[s.selectedIndex = i];
        o.number = pop();
        o.text = o.number.text;
    }
    else {
        t.number = pop();
        t.value = t.number.text;
    }
    savestate();
}
function ondel() {
    if (err(storagecheck())) return;
    calc.storage.remove(calc.storage.selectedIndex++);
    savestate();
}
function onmoveup() {
    var s, i, o;

    s = calc.storage;
    if (err(storagecheck())) return;
    i = s.selectedIndex;
    if (!i)
        if (err("Selected storage number already at top")) return;
    o = s.options[i];
    s.remove(i);
    s.seladd(o, --i);
    s.selectedIndex = i;
    savestate();
}
function onmovedown() {
    var s, i, o;

    s = calc.storage;
    if (err(storagecheck())) return;
    i = s.selectedIndex;
    if (i == s.length - 2)
        if (err("Selected storage number already at bottom")) return;
    o = s.options[i];
    s.remove(i);
    s.seladd(o, ++i);
    s.selectedIndex = i;
    savestate();
}
function stackselect() {
    var s, last, o;

    s = calc.stack;
    last = s.length - 1;
    o = s.options[last];
    s.remove(last);
    s.seladd(o, last);
    s.selectedIndex = last;
}
function pop() {
    var s, last, num, o;

    s = calc.stack;
    last = s.length - 1;
    num = s.options[last].number;
    s.remove(last);
    if (--nstack >= 3) last--;
    else s.seladd(newoption("", null), 0);
    stackselect();
    return (num);
}
function push() {
    var s;

    err(null);
    s = calc.stack;
    if (nstack++ < 3) s.remove(0);
    s.seladd(newoption(this.text, this.copy()), s.length);
    s.selectedIndex = s.length - 1;
}
function onstackdrop() {
    if (err(stackcheck(1))) return;
    pop();
    savestate();
}
function onpick(n) {
    var num, s;

    if (n < 0)
        if (err(selectcheck())) return;
        else n = calc.stack.length - calc.stack.selectedIndex - 1;
    else if (err(stackcheck(n + 1))) return;
    s = calc.stack;
    stacknumber(n).push();
    savestate();
}
function onroll(n) {
    var o, s;

    if (n < 0)
        if (err(selectcheck())) return;
        else n = calc.stack.length - calc.stack.selectedIndex - 1;
    else if (err(stackcheck(n + 1))) return;
    s = calc.stack;
    o = s.options[s.length - 1 - n];
    s.remove(s.length - 1 - n);
    s.seladd(o, s.length);
    stackselect();
    savestate();
}
function reduce(a) {
    var b, c, m, n, i;

    c = a.slice();
    n = c.length;
    b = calc.r.number.val;
    m = b.length;
    if (!m) return (c);
    while (n >= m) {//3 循环往复得到最终的余多项式, 当余多项式的长度小于除多项式的长度时，结束
        for (i = 0, j = n - m; i < m; c[j++] ^= b[i++]);// 0 移位 并且减去 除多项式
        while (n-- && !c[n]); // 1 得到中间余多项式的首个非零元素下标
        ++n; //2 确定中间余多项式的长度(即非零元素下标+1)
    }
    c.length = n;
    return (c);
}
function onreduce() {
    var a;

    if (err(scalarcheck(1))) return;
    a = pop().val;
    numberval(reduce(a)).push();
    savestate();
}
function add(a, b) {
    var c, i, n;

    c = new Array();
    n = Math.min(a.length, b.length);
    for (i = 0; i < n; i++) c[i] = a[i] ^ b[i];
    if (i < a.length) for (n = a.length; i < n; i++) c[i] = a[i];
    if (i < b.length) for (n = b.length; i < n; i++) c[i] = b[i];
    while (n-- && !c[n]);
    c.length = ++n;
    return (c);
}
function onadd() {
    var a, b;

    if (err(scalarcheck(2))) return;
    b = pop().val;
    a = pop().val;
    numberval(add(a, b)).push();
    savestate();
}
function sqr(a) {
    var b, i, j, n;

    n = a.length;
    if (!n) return (new Array(0));
    b = new Array(n + n - 1);
    b[0] = a[0];
    for (i = j = 1; i < n; b[j++] = 0, b[j++] = a[i++]);
    return (b);
}
function sqrreduce(a) {
    return (reduce(sqr(a)));
}
function onsqr() {
    var a;

    if (err(scalarcheck(1))) return;
    a = pop().val;
    numberval(sqr(a)).push();
    savestate();
}
function mul(a, b) {
    var c, l, m, n, i, j, k;

    l = a.length;
    m = b.length;
    n = l + m - 1;
    if (!l || !m) return (new Array(0));
    c = new Array(n);
    for (i = 0; i < n; c[i++] = 0);
    for (i = 0; i < l; i++) if (a[i])
        for (j = 0, k = i; j < m; c[k++] ^= b[j++]);
    while (n-- && !c[n]);
    c.length = ++n;
    return (c);
}
function mulreduce(a, b) {
    return (reduce(mul(a, b)));
}
function onmul() {
    var a, b;

    if (err(scalarcheck(2))) return;
    b = pop().val;
    a = pop().val;
    numberval(mul(a, b)).push();
    savestate();
}
function inv(a) {
    var c, d, b, n, i;

    c = reduce(a);
    n = calc.r.number.val.length - 2;
    if (n <= 0) return (c);
    for (b = 0; n >> b != 1; b++);
    while (b) {
        d = c.slice();
        for (i = n >> b; i--; d = sqrreduce(d));
        c = mulreduce(c, d);
        if (n >> --b & 1)
            c = mulreduce(a, sqrreduce(c));
    }
    return (sqrreduce(c));
}
function oninv() {
    var a;

    if (err(scalarcheck(1))) return;
    a = pop().val;
    numberval(inv(a)).push();
    savestate();
}
function div(a, b) {
    return (mul(a, inv(b)));
}
function divreduce(a, b) {
    return (reduce(div(a, b)));
}
function ondiv() {
    var a, b;

    if (err(scalarcheck(2))) return;
    b = pop().val;
    a = pop().val;
    numberval(div(a, b)).push();
    savestate();
}
function sqrt(a) {
    var c, n, i;

    c = reduce(a);
    n = calc.r.number.val.length - 2;
    for (i = 0; i < n; i++) c = sqrreduce(c);
    return (c);
}
function onsqrt() {
    var a;

    if (err(scalarcheck(1))) return;
    a = pop().val;
    numberval(sqrt(a)).push();
    savestate();
}
function trace(a) {
    var b, c, i, n;

    n = calc.r.number.val.length - 1;
    b = reduce(a);
    c = new Array(0);
    for (i = 0; i < n; i++) {
        c = add(c, b);
        b = sqrreduce(b);
    }
    return (c);
}
function ontrace() {
    var a;

    if (err(scalarcheck(1))) return;
    a = pop().val;
    numberval(trace(a)).push();
    savestate();
}
function halftrace(a) {
    var b, c, d, e, i, j, n;

    n = calc.r.number.val.length - 1;
    d = new Array(n);
    for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) d[j] = i == j;
        if (trace(d).length == 1) break;
    }
    b = reduce(a);
    c = new Array(0);
    e = new Array(0);
    for (i = 0; i < n; i++) {
        c = add(c, d);
        e = add(e, mulreduce(b, c));
        d = sqrreduce(d);
        b = sqrreduce(b);
    }
    return (e);
}
function onhalftrace() {
    var a;

    if (err(scalarcheck(1))) return;
    a = pop().val;
    numberval(halftrace(a)).push();
    savestate();
}
function onpoint() {
    var i, n, c;

    if (err(scalarcheck(currsystem.n))) return;
    num = new number();
    num.coor = new Array();
    for (i = currsystem.n; i-- > 0;) num.coor[i] = pop();
    if (num.coor.length == 3 && !num.coor[2].val.length) num.coor = null;
    num.valtotext();
    num.push();
    savestate();
}
function onscalar() {
    var i, c;

    if (stacknumber(0) == null || stacknumber(0).coor == null)
        if (err("Need at least 1 finite point on stack")) return;
    c = pop().coor;
    for (i = 0; i < currsystem.n; i++) num.coor[i] = c[i].push();
    savestate();
}
function system(n, nx, ny, check, neg, dbl, add) {
    var c;

    c = new Object();
    c.n = n;
    c.nx = nx;
    c.ny = ny;
    c.pointcheck = check;
    c.pointneg = neg;
    c.pointdbl = dbl;
    c.pointadd = add;
    return (c);
}
function initsystem() {
    affine = system(2, 0, 0, affinechk, affineneg,
        affinedbl, affineadd);
    projective = system(3, 1, 1, projectivechk, projectiveneg,
        projectivedbl, projectiveadd);
    jacobian = system(3, 2, 3, jacobianchk, jacobianneg,
        jacobiandbl, jacobianadd);
    lopezdahab = system(3, 1, 2, lopezdahabchk, lopezdahabneg,
        lopezdahabdbl, lopezdahabadd);
    currsystem = affine;
}
function onsystem(newsystem) {
    var o, i;

    o = calc.stack.options;
    for (i = o.length - nstack; i < o.length; i++) {
        convertcoor(o[i].number.coor, newsystem, currsystem);
        o[i].text = o[i].number.valtotext();
    }
    o = calc.storage.options;
    for (i = 0; i < o.length - 1; i++) {
        convertcoor(o[i].number.coor, newsystem, currsystem);
        o[i].text = o[i].number.valtotext();
    }
    stackselect();
    currsystem = newsystem;
    err(null);
    savestate();
}
function convertcoor(c, tosystem, fromsystem) {
    var z, i, n, d;

    if (c == null) return;
    if (tosystem == fromsystem) return;
    if (fromsystem == affine) {
        c[2] = numbertext("1");
        return;
    }
    z = c[2].val;
    i = reduce(inv(z));
    n = Math.abs(tosystem.nx - fromsystem.nx);
    d = tosystem.nx > fromsystem.nx ? z : i;
    while (n-- > 0) c[0].val = mulreduce(c[0].val, d);
    n = Math.abs(tosystem.ny - fromsystem.ny);
    d = tosystem.ny > fromsystem.ny ? z : i;
    while (n-- > 0) c[1].val = mulreduce(c[1].val, d);
    if (tosystem == affine) c.length = 2;
}
function onpointinf() {
    (new number()).push();
    savestate();
}
function pointcheck(n) {
    var i, num;

    for (i = 0; i < n; i++)
        if ((num = stacknumber(i)) == null || num.val != null ||
            num.coor != null && currsystem.pointcheck(num))
            break;
    if (i < n)
        return ("Need at least " + n + " point" + (n == 1 ? "" : "s") +
            " on the elliptic curve on the stack");
    return (null);
}
function onpointneg() {
    var a;

    a6 = calc.a6.number.val;
    a2 = calc.a2.number.val;
    if (err(pointcheck(1))) return;
    a = pop();
    if (a.coor == null) a.push();
    else currsystem.pointneg(a).push();
    savestate();
}
function onpointdbl() {
    var a;

    a6 = calc.a6.number.val;
    a2 = calc.a2.number.val;
    if (err(pointcheck(1))) return;
    a = pop();
    if (a.coor == null) a.push();
    else currsystem.pointdbl(a).push();
    savestate();
}
function onpointadd() {
    var a, b;

    a6 = calc.a6.number.val;
    a2 = calc.a2.number.val;
    if (err(pointcheck(2))) return;
    b = pop();
    a = pop();
    if (a.coor == null) b.push();
    else if (b.coor == null) a.push();
    else currsystem.pointadd(a, b).push();
    savestate();
}
function onpointmul() {
    a6 = calc.a6.number.val;
    a2 = calc.a2.number.val;
    if (stacknumber(1) == null || stacknumber(1).val == null ||
        pointcheck(1))
        if (err("Need a scalar and a point" +
            " on the elliptic curve on the stack")) return;
    b = pop();
    a = pop();
    c = new number();
    for (i = a.val.length; i-- > 0;) {
        c = c.coor != null ? currsystem.pointdbl(c) : c;
        if (a.val[i] == 0) continue;
        c = c.coor != null ? currsystem.pointadd(c, b) : b.copy();
    }
    c.push();
    savestate();
}
function numberval2(x, y) {
    var num;

    num = new number();
    num.coor = new Array();
    num.coor[0] = numberval(reduce(x));
    num.coor[1] = numberval(reduce(y));
    num.valtotext();
    return (num);
}
function numberval3(x, y, z) {
    var num;

    num = new number();
    num.coor = new Array();
    num.coor[0] = numberval(reduce(x));
    num.coor[1] = numberval(reduce(y));
    num.coor[2] = numberval(reduce(z));
    if (!num.coor[2].val.length) num.coor = null;
    num.valtotext();
    return (num);
}
function affinechk(a) {
    var x, y, t1, t2, t3;

    x = a.coor[0].val;
    y = a.coor[1].val;
    t1 = mulreduce(y, add(y, x));
    t2 = mulreduce(sqrreduce(x), add(x, a2));
    t3 = a6;
    return (add(add(t1, t2), t3).length != 0);
}
function affineneg(a) {
    var x1, y1;

    x1 = a.coor[0].val;
    y1 = a.coor[1].val;
    return (numberval2(x1, add(x1, y1)));
}
function affinedbl(a) {
    var x1, y1, m, x3, y3;

    x1 = a.coor[0].val;
    y1 = a.coor[1].val;
    if (!x1.length) return (new number());
    m = add(x1, divreduce(y1, x1));
    x3 = add(add(sqrreduce(m), m), a2);
    y3 = add(add(mulreduce(m, add(x1, x3)), x3), y1);
    return (numberval2(x3, y3));
}
function affineadd(a, b) {
    var x1, y1, x2, y2, dx, dy, m, x3, y3;

    x1 = a.coor[0].val;
    y1 = a.coor[1].val;
    x2 = b.coor[0].val;
    y2 = b.coor[1].val;
    dx = add(x1, x2);
    dy = add(y1, y2);
    if (!dx.length) return (!dy.length ? affinedbl(a) : new number());
    m = divreduce(dy, dx);
    x3 = add(add(add(add(sqrreduce(m), m), x1), x2), a2);
    y3 = add(add(mulreduce(m, add(x1, x3)), x3), y1);
    return (numberval2(x3, y3));
}
function projectivechk(a) {
    var x, y, z, t1, t2, t3;

    x = a.coor[0].val;
    y = a.coor[1].val;
    z = a.coor[2].val;
    t1 = mulreduce(mulreduce(z, y), add(y, x));
    t2 = mulreduce(sqrreduce(x), add(x, mulreduce(z, a2)));
    t3 = mulreduce(mulreduce(z, sqrreduce(z)), a6);
    return (add(add(t1, t2), t3).length != 0);
}
function projectiveneg(a) {
    var x1, y1, z1;

    x1 = a.coor[0].val;
    y1 = a.coor[1].val;
    z1 = a.coor[2].val;
    return (numberval3(x1, add(x1, y1), z1));
}
function projectivedbl(a) {
    var x1, y1, z1, a, b, c, d, e, x3, y3, z3;

    x1 = a.coor[0].val;
    y1 = a.coor[1].val;
    z1 = a.coor[2].val;
    a = sqrreduce(x1);
    b = add(a, mulreduce(y1, z1));
    c = mulreduce(x1, z1);
    d = sqrreduce(c);
    e = add(add(sqrreduce(b), mulreduce(b, c)), mulreduce(a2, d));
    x3 = mulreduce(c, e);
    y3 = add(mulreduce(add(b, c), e), mulreduce(sqrreduce(a), c));
    z3 = mulreduce(c, d);
    return (numberval3(x3, y3, z3));
}
function projectiveadd(a, b) {
    var x1, y1, z1, x2, y2, z2, a, b, c, d, e, x3, y3, z3;

    x1 = a.coor[0].val;
    y1 = a.coor[1].val;
    z1 = a.coor[2].val;
    x2 = b.coor[0].val;
    y2 = b.coor[1].val;
    z2 = b.coor[2].val;
    a = add(mulreduce(y1, z2), mulreduce(z1, y2));
    b = add(mulreduce(x1, z2), mulreduce(z1, x2));
    if (!a.length && !b.length) return (projectivedbl(a));
    c = sqrreduce(b);
    d = mulreduce(z1, z2);
    e = add(mulreduce(add(add(sqrreduce(a), mulreduce(a, b)),
        mulreduce(a2, c)), d), mulreduce(b, c));
    x3 = mulreduce(b, e);
    y3 = add(mulreduce(mulreduce(c, add(mulreduce(a, x1),
        mulreduce(y1, b))), z2), mulreduce(add(a, b), e));
    z3 = mulreduce(mulreduce(sqrreduce(b), b), d);
    return (numberval3(x3, y3, z3));
}
function jacobianchk(a) {
    var x, y, z, t1, t2, t3;

    x = a.coor[0].val;
    y = a.coor[1].val;
    z = a.coor[2].val;
    t1 = mulreduce(y, add(y, mulreduce(z, x)));
    t2 = mulreduce(sqrreduce(x), add(x, mulreduce(sqrreduce(z), a2)));
    t3 = mulreduce(sqrreduce(mulreduce(z, sqrreduce(z))), a6);
    return (add(add(t1, t2), t3).length != 0);
}
function jacobianneg(a) {
    var x1, y1, z1;

    x1 = a.coor[0].val;
    y1 = a.coor[1].val;
    z1 = a.coor[2].val;
    return (numberval3(x1, add(mulreduce(x1, z1), y1), z1));
}
function jacobiandbl(a) {
    var x1, y1, z1, a, b, c, x3, y3, z3;

    x1 = a.coor[0].val;
    y1 = a.coor[1].val;
    z1 = a.coor[2].val;
    a = sqrreduce(x1);
    b = sqrreduce(a);
    c = sqrreduce(z1);
    x3 = add(b, mulreduce(a6, sqrreduce(sqrreduce(c))));
    z3 = mulreduce(x1, c);
    y3 = add(mulreduce(b, z3),
        mulreduce(add(add(a, mulreduce(y1, z1)), z3), x3));
    return (numberval3(x3, y3, z3));
}
function jacobianadd(a, b) {
    var x1, y1, z1, x2, y2, z2, a, b, c, d, e, f, g, h, i, x3, y3, z3;

    x1 = a.coor[0].val;
    y1 = a.coor[1].val;
    z1 = a.coor[2].val;
    x2 = b.coor[0].val;
    y2 = b.coor[1].val;
    z2 = b.coor[2].val;
    a = mulreduce(x1, sqrreduce(z2));
    b = mulreduce(x2, sqrreduce(z1));
    c = mulreduce(y1, mulreduce(sqrreduce(z2), z2));
    d = mulreduce(y2, mulreduce(sqrreduce(z1), z1));
    e = add(a, b);
    f = add(c, d);
    if (!e.length && !f.length) return (jacobiandbl(a));
    g = mulreduce(e, z1);
    h = add(mulreduce(f, x2), mulreduce(g, y2));
    z3 = mulreduce(g, z2);
    i = add(f, z3);
    x3 = add(add(mulreduce(a2, sqrreduce(z3)), mulreduce(f, i)),
        mulreduce(sqrreduce(e), e));
    y3 = add(mulreduce(i, x3), mulreduce(sqrreduce(g), h));
    return (numberval3(x3, y3, z3));
}
function lopezdahabchk(a) {
    var x, y, z, t1, t2, t3;

    x = a.coor[0].val;
    y = a.coor[1].val;
    z = a.coor[2].val;
    t1 = mulreduce(y, add(y, mulreduce(z, x)));
    t2 = mulreduce(mulreduce(z, sqrreduce(x)), add(x, mulreduce(z, a2)));
    t3 = mulreduce(sqrreduce(sqrreduce(z)), a6);
    return (add(add(t1, t2), t3).length != 0);
}
function lopezdahabneg(a) {
    var x1, y1, z1;

    x1 = a.coor[0].val;
    y1 = a.coor[1].val;
    z1 = a.coor[2].val;
    return (numberval3(x1, add(mulreduce(x1, z1), y1), z1));
}
function lopezdahabdbl(a) {
    var x1, y1, z1, a, b, c, x3, y3, z3;

    x1 = a.coor[0].val;
    y1 = a.coor[1].val;
    z1 = a.coor[2].val;
    a = sqrreduce(z1);
    b = mulreduce(a6, sqrreduce(a));
    c = sqrreduce(x1);
    z3 = mulreduce(a, c);
    x3 = add(sqrreduce(c), b);
    y3 = add(mulreduce(add(add(sqrreduce(y1), mulreduce(a2, z3)), b), x3),
        mulreduce(z3, b));
    return (numberval3(x3, y3, z3));
}
function lopezdahabadd(a, b) {
    var x1, y1, z1, x2, y2, z2, a, b, c, d, e, f, g, h, i, j, x3, y3, z3;

    x1 = a.coor[0].val;
    y1 = a.coor[1].val;
    z1 = a.coor[2].val;
    x2 = b.coor[0].val;
    y2 = b.coor[1].val;
    z2 = b.coor[2].val;
    a = mulreduce(x1, z2);
    b = mulreduce(x2, z1);
    c = sqrreduce(a);
    d = sqrreduce(b);
    e = add(a, b);
    f = add(c, d);
    g = mulreduce(y1, sqrreduce(z2));
    h = mulreduce(y2, sqrreduce(z1));
    i = add(g, h);
    if (!e.length && !i.length) return (lopezdahabdbl(a));
    j = mulreduce(i, e);
    z3 = mulreduce(mulreduce(f, z1), z2);
    x3 = add(mulreduce(a, add(h, d)), mulreduce(b, add(c, g)));
    y3 = add(mulreduce(add(mulreduce(a, j), mulreduce(f, g)), f),
        mulreduce(add(j, z3), x3));
    return (numberval3(x3, y3, z3));
}
