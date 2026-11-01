/*!
 * HSC26 CTG Board Ranking — shared helpers (used by hsc-science.html,
 * hsc-science-details.html and college-ranking.html)
 *
 *  1. English-style capitalisation. The board JSON is entirely lower-case
 *     ("md. rezaul karim"), so names / colleges / subjects are title-cased here.
 *  2. Converts a raw JSON record ("Roll No", "Subjects": [...]) into the short-key
 *     format the ranking pages already understand (rk, rl, nm, gp, inst, tm ...).
 *
 *  The raw JSON file never has to be edited — just upload it as-is.
 */
(function (root) {
  'use strict';

  // Words kept lower-case inside college / subject names (not at the start).
  var SMALL = { and: 1, of: 1, the: 1, for: 1, in: 1, at: 1 };
  // Abbreviations that must be fully upper-case in college names.
  var UPPER = { dc: 1, cda: 1, cmp: 1, bepza: 1, biam: 1, kafco: 1 };
  // The source cuts some long college names at 50 characters ("... school and colleg").
  var FIXES = { colleg: 'College' };

  function clean(s) {
    return String(s == null ? '' : s)
      .toLowerCase()
      .replace(/\bmd:/g, 'md.')                                 // typo in source: "md: sajid" -> "md. sajid"
      .replace(/\b(md|mst|miss|mrs|mr)\.(?=[a-z])/g, '$1. ')    // "md.nazmul" -> "md. nazmul"
      .replace(/\s+/g, ' ')                                     // "minhazur  rahman" -> single space
      .trim();
  }

  // Upper-case a letter at the start of a token or after . ( - / , &
  // (an apostrophe is NOT a boundary, so "cox's" -> "Cox's", never "Cox'S").
  function cap(token) {
    return token.replace(/(^|[.(\-\/,&])([a-z])/g, function (m, p, c) {
      return p + c.toUpperCase();
    });
  }

  var cache = Object.create(null);

  /** kind: 'name' | 'inst' | 'subject' */
  function title(value, kind) {
    var key = kind + '|' + value;
    var hit = cache[key];
    if (hit !== undefined) return hit;

    var parts = clean(value).split(' ');
    for (var i = 0; i < parts.length; i++) {
      var t = parts[i];
      if (kind !== 'name' && i > 0 && SMALL[t]) continue;
      if (kind === 'inst') {
        // look at the word without trailing punctuation ("colleg," -> core "colleg", tail ",")
        var core = t.replace(/[,.)]+$/, ''), tail = t.slice(core.length);
        if (UPPER[core]) { parts[i] = core.toUpperCase() + tail; continue; }
        if (FIXES[core]) { parts[i] = FIXES[core] + tail; continue; }
      }
      parts[i] = cap(t);
    }
    return (cache[key] = parts.join(' '));
  }

  function boardName(raw) {
    // "of Intermediate and Secondary Education, Chattogram" -> "Chattogram"
    var s = String(raw || '');
    var last = s.split(',').pop();
    return title(last || s, 'name');
  }

  function resultLabel(gpa, total, subs, res) {
    if (res === 'Absent' || res === 'Reported') return res;
    if (res === 'Fail') return 'Failed';
    if (gpa > 0) return 'Passed';
    if (!total) return 'No marks recorded';
    for (var i = 0; i < subs.length; i++) if (subs[i].Grade === 'F') return 'Failed';
    return 'Incomplete';
  }

  /** Convert one raw record. full=false keeps only what the ranking list needs. */
  function one(r, full) {
    var gpa = Number(r.GPA);
    if (!isFinite(gpa)) gpa = 0;
    var total = Number(r['Total Marks']);
    if (!isFinite(total)) total = 0;

    var o = {
      rk: r.Rank,
      rl: String(r['Roll No'] != null ? r['Roll No'] : r.Roll),
      nm: title(r.Name, 'name'),
      gp: gpa.toFixed(2),
      tm: total,
      inst: title(r.Institute, 'inst'),
      re: r.Result || ''
    };
    if (!full) return o;

    var subs = Array.isArray(r.Subjects) ? r.Subjects : [];
    o.rs = resultLabel(gpa, total, subs, r.Result);
    o.fn = title(r["Father's Name"], 'name');
    o.mn = title(r["Mother's Name"], 'name');
    o.rg = String(r['Reg. No'] || r['Reg. NO'] || '');
    o.ss = r.Session || '';
    o.tp = title(r.Type, 'name');
    o.gp_grp = title(r.Group, 'name');
    o.bd = boardName(r.Board);
    o.sb = {};
    o.subjects = subs.map(function (x, i) {
      var name = title(x['Subject Name'], 'subject') || ('Subject ' + (x['Subject Code'] || ''));
      var rawM = String(x['Obtain Marks'] == null ? '' : x['Obtain Marks']).trim();
      var marks = Number(rawM) || 0;
      o.sb[name] = marks;
      return {
        n: name,
        c: String(x['Subject Code'] || ''),
        g: x.Grade || '',
        m: marks,
        a: (rawM !== '' && !isFinite(Number(rawM))) ? 1 : 0,   // non-numeric (e.g. AAA) = absent in that subject
        // Verified on the data: in every passed record where a grade is F, it is the
        // LAST listed subject only -> the last of 7 subjects is the optional 4th subject.
        fourth: subs.length === 7 && i === 6
      };
    });
    return o;
  }

  function normalize(list, full) {
    var out = new Array(list.length);
    for (var i = 0; i < list.length; i++) out[i] = one(list[i], !!full);
    return out;
  }

  root.HSC26 = { title: title, one: one, normalize: normalize };
})(typeof window !== 'undefined' ? window : globalThis);
