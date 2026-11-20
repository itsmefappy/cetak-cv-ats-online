(function () {
  "use strict";

  var STORAGE_KEY = "ats_resume_data_v1";

  var emptyModel = {
    personal: { fullName: "", headline: "", email: "", phone: "", location: "", linkedin: "", portfolio: "" },
    summary: "",
    experience: [],
    education: [],
    skills: { hard: "", soft: "" },
    projects: [],
    config: { template: "classic", fontSize: "medium", fontFamily: "arial" }
  };

  var state = loadState();

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return sanitizeState(JSON.parse(raw));
    } catch (e) {}
    return JSON.parse(JSON.stringify(emptyModel));
  }

  function sanitizeState(data) {
    var out = JSON.parse(JSON.stringify(emptyModel));
    if (!data || typeof data !== "object") return out;
    out.personal = Object.assign(out.personal, data.personal || {});
    out.summary = typeof data.summary === "string" ? data.summary : "";
    out.experience = Array.isArray(data.experience) ? data.experience : [];
    out.education = Array.isArray(data.education) ? data.education : [];
    out.skills = Object.assign(out.skills, data.skills || {});
    out.projects = Array.isArray(data.projects) ? data.projects : [];
    out.config = Object.assign(out.config, data.config || {});
    return out;
  }

  var saveTimer = null;
  var saveStatusTimer = null;

  function setSaveStatus(text, saving) {
    var el = document.getElementById("save-status");
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("saving", !!saving);
  }

  function persistState() {
    clearTimeout(saveTimer);
    setSaveStatus("Menyimpan...", true);
    saveTimer = setTimeout(function () {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        clearTimeout(saveStatusTimer);
        saveStatusTimer = setTimeout(function () { setSaveStatus("Tersimpan", false); }, 600);
      } catch (e) {
        setSaveStatus("Gagal menyimpan", true);
      }
    }, 200);
  }

  function uid(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderForm() {
    var root = document.getElementById("form-root");
    if (!root) return;
    root.innerHTML = [
      renderPersonalSection(),
      renderSummarySection(),
      renderExperienceSection(),
      renderEducationSection(),
      renderSkillsSection(),
      renderProjectsSection()
    ].join("");
    bindFormEvents();
    renderScore();
  }

  function renderPersonalSection() {
    var p = state.personal;
    return (
      '<details class="acc" open>' +
      '  <summary>Informasi Pribadi</summary>' +
      '  <div class="acc-body">' +
      '    <div class="field"><label>Nama Lengkap</label><input type="text" data-path="personal.fullName" value="' + escapeHtml(p.fullName) + '" placeholder="e.g. Budi Pratama"></div>' +
      '    <div class="field"><label>Jabatan / Headline</label><input type="text" data-path="personal.headline" value="' + escapeHtml(p.headline) + '" placeholder="e.g. Senior Software Engineer"></div>' +
      '    <div class="grid-2">' +
      '      <div class="field"><label>Email</label><input type="email" data-path="personal.email" value="' + escapeHtml(p.email) + '" placeholder="budi@email.com"></div>' +
      '      <div class="field"><label>Nomor Telepon</label><input type="tel" data-path="personal.phone" value="' + escapeHtml(p.phone) + '" placeholder="+62 812-..."></div>' +
      '    </div>' +
      '    <div class="field"><label>Kota, Negara</label><input type="text" data-path="personal.location" value="' + escapeHtml(p.location) + '" placeholder="Jakarta, Indonesia"></div>' +
      '    <div class="grid-2">' +
      '      <div class="field"><label>LinkedIn</label><input type="text" data-path="personal.linkedin" value="' + escapeHtml(p.linkedin) + '" placeholder="linkedin.com/in/username"></div>' +
      '      <div class="field"><label>Portofolio / GitHub</label><input type="text" data-path="personal.portfolio" value="' + escapeHtml(p.portfolio) + '" placeholder="github.com/username"></div>' +
      '    </div>' +
      '  </div>' +
      '</details>'
    );
  }

  function renderSummarySection() {
    var text = state.summary || "";
    var words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return (
      '<details class="acc" open>' +
      '  <summary>Ringkasan Profesional</summary>' +
      '  <div class="acc-body">' +
      '    <div class="field">' +
      '      <label>Profil Singkat (3-4 kalimat rekomendasi ATS)</label>' +
      '      <textarea data-path="summary" placeholder="Ceritakan keahlian utama, tahun pengalaman, dan pencapaian terukur...">' + escapeHtml(text) + '</textarea>' +
      '      <div class="counter">' + words + ' kata | ' + text.length + ' karakter</div>' +
      '    </div>' +
      '  </div>' +
      '</details>'
    );
  }

  function renderExperienceSection() {
    var items = state.experience || [];
    var html = '<details class="acc" open><summary>Pengalaman Kerja (' + items.length + ')</summary><div class="acc-body">';
    for (var i = 0; i < items.length; i++) {
      var exp = items[i];
      html += (
        '<div class="repeater-item" data-index="' + i + '">' +
        '  <div class="repeater-head">' +
        '    <strong>#' + (i + 1) + ' ' + escapeHtml(exp.position || "Posisi Baru") + '</strong>' +
        '    <div class="repeater-actions">' +
        '      <button type="button" class="btn btn-light btn-xs" data-action="move-up" data-type="experience" data-idx="' + i + '" aria-label="Pindahkan pengalaman ke atas"' + (i === 0 ? " disabled" : "") + '>&uarr;</button>' +
        '      <button type="button" class="btn btn-light btn-xs" data-action="move-down" data-type="experience" data-idx="' + i + '" aria-label="Pindahkan pengalaman ke bawah"' + (i === items.length - 1 ? " disabled" : "") + '>&darr;</button>' +
        '      <button type="button" class="btn btn-danger btn-xs" data-action="delete" data-type="experience" data-idx="' + i + '" aria-label="Hapus pengalaman">&times;</button>' +
        '    </div>' +
        '  </div>' +
        '  <div class="grid-2">' +
        '    <div class="field"><label>Posisi / Role</label><input type="text" data-exp-field="position" data-idx="' + i + '" value="' + escapeHtml(exp.position) + '"></div>' +
        '    <div class="field"><label>Perusahaan</label><input type="text" data-exp-field="company" data-idx="' + i + '" value="' + escapeHtml(exp.company) + '"></div>' +
        '  </div>' +
        '  <div class="field"><label>Lokasi</label><input type="text" data-exp-field="location" data-idx="' + i + '" value="' + escapeHtml(exp.location) + '" placeholder="e.g. Jakarta, Indonesia"></div>' +
        '  <div class="grid-2">' +
        '    <div class="field"><label>Mulai (Bulan / Tahun)</label><input type="text" data-exp-field="startDate" data-idx="' + i + '" value="' + escapeHtml(exp.startDate) + '" placeholder="2021-01 atau Jan 2021"></div>' +
        '    <div class="field">' +
        '      <label>Selesai</label>' +
        '      <input type="text" data-exp-field="endDate" data-idx="' + i + '" value="' + escapeHtml(exp.endDate) + '" placeholder="2023-12"' + (exp.current ? " disabled" : "") + '>' +
        '      <label class="check-row mt-1"><input type="checkbox" data-exp-field="current" data-idx="' + i + '"' + (exp.current ? " checked" : "") + '> Masih bekerja di sini</label>' +
        '    </div>' +
        '  </div>' +
        '  <div class="field"><label>Deskripsi Poin Kerja (Awali tanda - untuk bullet)</label><textarea data-exp-field="description" data-idx="' + i + '" placeholder="- Memimpin implementasi...\n- Mengurangi biaya sebesar 20%...">' + escapeHtml(exp.description) + '</textarea></div>' +
        '</div>'
      );
    }
    html += '<button type="button" class="btn btn-light add-btn" data-action="add" data-type="experience">+ Tambah Pengalaman</button></div></details>';
    return html;
  }

  function renderEducationSection() {
    var items = state.education || [];
    var html = '<details class="acc" open><summary>Pendidikan (' + items.length + ')</summary><div class="acc-body">';
    for (var i = 0; i < items.length; i++) {
      var edu = items[i];
      html += (
        '<div class="repeater-item" data-index="' + i + '">' +
        '  <div class="repeater-head">' +
        '    <strong>#' + (i + 1) + ' ' + escapeHtml(edu.institution || "Institusi Baru") + '</strong>' +
        '    <div class="repeater-actions">' +
        '      <button type="button" class="btn btn-light btn-xs" data-action="move-up" data-type="education" data-idx="' + i + '" aria-label="Pindahkan pendidikan ke atas"' + (i === 0 ? " disabled" : "") + '>&uarr;</button>' +
        '      <button type="button" class="btn btn-light btn-xs" data-action="move-down" data-type="education" data-idx="' + i + '" aria-label="Pindahkan pendidikan ke bawah"' + (i === items.length - 1 ? " disabled" : "") + '>&darr;</button>' +
        '      <button type="button" class="btn btn-danger btn-xs" data-action="delete" data-type="education" data-idx="' + i + '" aria-label="Hapus entri pendidikan">&times;</button>' +
        '    </div>' +
        '  </div>' +
        '  <div class="field"><label>Nama Institusi / Universitas</label><input type="text" data-edu-field="institution" data-idx="' + i + '" value="' + escapeHtml(edu.institution) + '"></div>' +
        '  <div class="grid-2">' +
        '    <div class="field"><label>Gelar</label><input type="text" data-edu-field="degree" data-idx="' + i + '" value="' + escapeHtml(edu.degree) + '" placeholder="Sarjana Komputer"></div>' +
        '    <div class="field"><label>Jurusan</label><input type="text" data-edu-field="field" data-idx="' + i + '" value="' + escapeHtml(edu.field) + '" placeholder="Teknik Informatika"></div>' +
        '  </div>' +
        '  <div class="grid-2">' +
        '    <div class="field"><label>Tahun Mulai</label><input type="text" data-edu-field="startYear" data-idx="' + i + '" value="' + escapeHtml(edu.startYear) + '" placeholder="2016"></div>' +
        '    <div class="field"><label>Tahun Lulus</label><input type="text" data-edu-field="endYear" data-idx="' + i + '" value="' + escapeHtml(edu.endYear) + '" placeholder="2020"></div>' +
        '  </div>' +
        '  <div class="field"><label>IPK / GPA (Opsional)</label><input type="text" data-edu-field="gpa" data-idx="' + i + '" value="' + escapeHtml(edu.gpa) + '" placeholder="3.75 / 4.00"></div>' +
        '  <div class="field"><label>Aktivitas / Pencapaian (Opsional)</label><textarea data-edu-field="achievements" data-idx="' + i + '" placeholder="Penerima beasiswa prestasi; Publikasi jurnal...">' + escapeHtml(edu.achievements) + '</textarea></div>' +
        '</div>'
      );
    }
    html += '<button type="button" class="btn btn-light add-btn" data-action="add" data-type="education">+ Tambah Pendidikan</button></div></details>';
    return html;
  }

  function renderSkillsSection() {
    return (
      '<details class="acc" open>' +
      '  <summary>Keahlian (Skills)</summary>' +
      '  <div class="acc-body">' +
      '    <div class="field"><label>Hard Skills (Pisahkan koma)</label><textarea data-path="skills.hard" placeholder="JavaScript, Node.js, PostgreSQL, Docker...">' + escapeHtml(state.skills.hard) + '</textarea></div>' +
      '    <div class="field"><label>Soft Skills (Pisahkan koma)</label><textarea data-path="skills.soft" placeholder="Kepemimpinan, Komunikasi, Manajemen Waktu...">' + escapeHtml(state.skills.soft) + '</textarea></div>' +
      '  </div>' +
      '</details>'
    );
  }

  function renderProjectsSection() {
    var items = state.projects || [];
    var html = '<details class="acc"><summary>Sertifikasi / Proyek (' + items.length + ')</summary><div class="acc-body">';
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      html += (
        '<div class="repeater-item" data-index="' + i + '">' +
        '  <div class="repeater-head">' +
        '    <strong>#' + (i + 1) + ' ' + escapeHtml(item.name || "Item Baru") + '</strong>' +
        '    <div class="repeater-actions">' +
        '      <button type="button" class="btn btn-light btn-xs" data-action="move-up" data-type="projects" data-idx="' + i + '" aria-label="Pindahkan item ke atas"' + (i === 0 ? " disabled" : "") + '>&uarr;</button>' +
        '      <button type="button" class="btn btn-light btn-xs" data-action="move-down" data-type="projects" data-idx="' + i + '" aria-label="Pindahkan item ke bawah"' + (i === items.length - 1 ? " disabled" : "") + '>&darr;</button>' +
        '      <button type="button" class="btn btn-danger btn-xs" data-action="delete" data-type="projects" data-idx="' + i + '" aria-label="Hapus item">&times;</button>' +
        '    </div>' +
        '  </div>' +
        '  <div class="grid-2">' +
        '    <div class="field"><label>Nama Sertifikat / Proyek</label><input type="text" data-proj-field="name" data-idx="' + i + '" value="' + escapeHtml(item.name) + '"></div>' +
        '    <div class="field"><label>Tahun</label><input type="text" data-proj-field="year" data-idx="' + i + '" value="' + escapeHtml(item.year) + '" placeholder="2023"></div>' +
        '  </div>' +
        '  <div class="field"><label>Penerbit / Tautan</label><input type="text" data-proj-field="issuerOrLink" data-idx="' + i + '" value="' + escapeHtml(item.issuerOrLink) + '" placeholder="e.g. AWS / github.com/..."></div>' +
        '  <div class="field"><label>Deskripsi Ringkas</label><textarea data-proj-field="description" data-idx="' + i + '" placeholder="Penjelasan singkat peran atau cakupan...">' + escapeHtml(item.description) + '</textarea></div>' +
        '</div>'
      );
    }
    html += '<button type="button" class="btn btn-light add-btn" data-action="add" data-type="projects">+ Tambah Proyek / Sertifikasi</button></div></details>';
    return html;
  }

  function bindFormEvents() {
    var root = document.getElementById("form-root");
    if (!root) return;

    root.oninput = function (e) {
      var target = e.target;
      var path = target.getAttribute("data-path");
      if (path) {
        setDeepValue(state, path, target.value);
        if (path === "summary") {
          var counter = target.parentElement.querySelector(".counter");
          if (counter) {
            var words = target.value.trim() ? target.value.trim().split(/\s+/).length : 0;
            counter.innerText = words + " kata | " + target.value.length + " karakter";
          }
        }
      }

      var expField = target.getAttribute("data-exp-field");
      if (expField && target.type !== "checkbox") {
        var idx = parseInt(target.getAttribute("data-idx"), 10);
        if (state.experience[idx]) {
          state.experience[idx][expField] = target.value;
        }
      }

      var eduField = target.getAttribute("data-edu-field");
      if (eduField) {
        var eIdx = parseInt(target.getAttribute("data-idx"), 10);
        if (state.education[eIdx]) {
          state.education[eIdx][eduField] = target.value;
        }
      }

      var prjField = target.getAttribute("data-proj-field");
      if (prjField) {
        var pIdx = parseInt(target.getAttribute("data-idx"), 10);
        if (state.projects[pIdx]) {
          state.projects[pIdx][prjField] = target.value;
        }
      }

      persistState();
      renderPreview();
      renderScore();
    };

    root.onchange = function (e) {
      var target = e.target;
      if (target.getAttribute("data-exp-field") === "current") {
        var idx = parseInt(target.getAttribute("data-idx"), 10);
        if (state.experience[idx]) {
          state.experience[idx].current = target.checked;
          if (target.checked) state.experience[idx].endDate = "";
        }
        persistState();
        renderForm();
        renderPreview();
      }
    };

    root.onclick = function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      var action = btn.getAttribute("data-action");
      var type = btn.getAttribute("data-type");
      if (!action || !type) return;

      var list = state[type];
      if (!Array.isArray(list)) return;

      if (action === "add") {
        if (type === "experience") {
          list.push({ id: uid("exp"), position: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" });
        } else if (type === "education") {
          list.push({ id: uid("edu"), institution: "", degree: "", field: "", startYear: "", endYear: "", gpa: "", achievements: "" });
        } else if (type === "projects") {
          list.push({ id: uid("prj"), name: "", issuerOrLink: "", year: "", description: "" });
        }
      } else {
        var idx = parseInt(btn.getAttribute("data-idx"), 10);
        if (isNaN(idx)) return;
        if (action === "delete") {
          list.splice(idx, 1);
        } else if (action === "move-up" && idx > 0) {
          var itemUp = list.splice(idx, 1)[0];
          list.splice(idx - 1, 0, itemUp);
        } else if (action === "move-down" && idx < list.length - 1) {
          var itemDown = list.splice(idx, 1)[0];
          list.splice(idx + 1, 0, itemDown);
        }
      }

      persistState();
      renderForm();
      renderPreview();
    };
  }

  function setDeepValue(obj, path, val) {
    var parts = path.split(".");
    var curr = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      if (!curr[parts[i]]) curr[parts[i]] = {};
      curr = curr[parts[i]];
    }
    curr[parts[parts.length - 1]] = val;
  }

  function renderPreview() {
    var container = document.getElementById("resume-page");
    if (!container) return;

    var tpl = state.config.template || "classic";
    var font = state.config.fontFamily || "arial";
    container.className = "resume-page tpl-" + tpl + " font-" + font;
    container.setAttribute("data-size", state.config.fontSize || "medium");

    var html = "";
    if (tpl === "modern") {
      html = renderModernPreview();
    } else {
      html = renderClassicPreview();
    }
    container.innerHTML = html;
    updateMobileScale();
  }

  function updateMobileScale() {
    var scaler = document.getElementById("preview-scaler");
    var wrapper = document.querySelector(".preview-wrapper");
    if (!scaler || !wrapper) return;

    if (window.innerWidth <= 1024) {
      var wrapperWidth = wrapper.clientWidth - 16;
      var a4WidthPx = 794; // ~210mm di 96dpi
      if (wrapperWidth < a4WidthPx && wrapperWidth > 120) {
        var scale = Math.max(0.38, Math.min(1, wrapperWidth / a4WidthPx));
        scaler.style.transform = "scale(" + scale + ")";
        scaler.style.transformOrigin = "top left";
        scaler.style.marginBottom = "-" + Math.round((1 - scale) * 1120) + "px";
        return;
      }
    }
    scaler.style.transform = "none";
    scaler.style.marginBottom = "0";
  }

  function renderClassicPreview() {
    var p = state.personal;
    var contacts = [];
    if (p.phone) contacts.push("<span>" + escapeHtml(p.phone) + "</span>");
    if (p.email) contacts.push('<span><a href="mailto:' + escapeHtml(p.email) + '">' + escapeHtml(p.email) + "</a></span>");
    if (p.location) contacts.push("<span>" + escapeHtml(p.location) + "</span>");
    if (p.linkedin) contacts.push("<span>" + escapeHtml(p.linkedin) + "</span>");
    if (p.portfolio) contacts.push("<span>" + escapeHtml(p.portfolio) + "</span>");

    var out = "";
    out += '<header class="rp-header">';
    out += '  <h1 class="rp-name">' + escapeHtml(p.fullName || "NAMA LENGKAP") + "</h1>";
    if (p.headline) out += '  <div class="rp-headline">' + escapeHtml(p.headline) + "</div>";
    if (contacts.length) out += '  <div class="rp-contact">' + contacts.join("") + "</div>";
    out += "</header>";

    if (state.summary && state.summary.trim()) {
      out += '<section class="rp-section">';
      out += "  <h2>Ringkasan Profesional</h2>";
      out += '  <p class="rp-text">' + escapeHtml(state.summary) + "</p>";
      out += "</section>";
    }

    if (state.experience && state.experience.length) {
      out += '<section class="rp-section">';
      out += "  <h2>Pengalaman Kerja</h2>";
      for (var i = 0; i < state.experience.length; i++) {
        var e = state.experience[i];
        if (!e.position && !e.company) continue;
        var endStr = e.current ? "Present" : (e.endDate || "");
        var dateStr = e.startDate || e.endDate
          ? (e.startDate || "") + " - " + (endStr || "")
          : endStr;
        out += '<article class="rp-entry">';
        out += '  <div class="rp-entry-head">';
        out += '    <div><h3 class="rp-role">' + escapeHtml(e.position) + '</h3><div class="rp-org">' + escapeHtml(e.company) + (e.location ? ", " + escapeHtml(e.location) : "") + "</div></div>";
        out += '    <div class="rp-date">' + escapeHtml(dateStr) + "</div>";
        out += "  </div>";
        out += renderBullets(e.description);
        out += "</article>";
      }
      out += "</section>";
    }

    if (state.education && state.education.length) {
      out += '<section class="rp-section">';
      out += "  <h2>Pendidikan</h2>";
      for (var j = 0; j < state.education.length; j++) {
        var ed = state.education[j];
        if (!ed.institution && !ed.degree) continue;
        out += '<article class="rp-entry">';
        out += '  <div class="rp-entry-head">';
        out += '    <div><h3 class="rp-role">' + escapeHtml(ed.institution) + '</h3><div class="rp-org">' + escapeHtml(ed.degree) + (ed.field ? ", " + escapeHtml(ed.field) : "") + (ed.gpa ? " (IPK: " + escapeHtml(ed.gpa) + ")" : "") + "</div></div>";
        out += '    <div class="rp-date">' + escapeHtml(ed.startYear || "") + (ed.endYear ? " - " + escapeHtml(ed.endYear) : "") + "</div>";
        out += "  </div>";
        if (ed.achievements) out += '<p class="rp-text">' + escapeHtml(ed.achievements) + "</p>";
        out += "</article>";
      }
      out += "</section>";
    }

    var hasSkills = (state.skills.hard && state.skills.hard.trim()) || (state.skills.soft && state.skills.soft.trim());
    if (hasSkills) {
      out += '<section class="rp-section">';
      out += "  <h2>Keahlian</h2>";
      if (state.skills.hard && state.skills.hard.trim()) {
        out += '<p class="rp-skill-line"><strong>Hard Skills:</strong> ' + escapeHtml(state.skills.hard) + "</p>";
      }
      if (state.skills.soft && state.skills.soft.trim()) {
        out += '<p class="rp-skill-line"><strong>Soft Skills:</strong> ' + escapeHtml(state.skills.soft) + "</p>";
      }
      out += "</section>";
    }

    if (state.projects && state.projects.length) {
      out += '<section class="rp-section">';
      out += "  <h2>Proyek &amp; Sertifikasi</h2>";
      for (var k = 0; k < state.projects.length; k++) {
        var pr = state.projects[k];
        if (!pr.name) continue;
        out += '<article class="rp-entry">';
        out += '  <div class="rp-entry-head">';
        out += '    <div><h3 class="rp-role">' + escapeHtml(pr.name) + "</h3>" + (pr.issuerOrLink ? '<div class="rp-org">' + escapeHtml(pr.issuerOrLink) + "</div>" : "") + "</div>";
        if (pr.year) out += '    <div class="rp-date">' + escapeHtml(pr.year) + "</div>";
        out += "  </div>";
        if (pr.description) out += '<p class="rp-text">' + escapeHtml(pr.description) + "</p>";
        out += "</article>";
      }
      out += "</section>";
    }

    return out;
  }

  function renderModernPreview() {
    var p = state.personal;
    var contacts = [];
    if (p.location) contacts.push("<span>" + escapeHtml(p.location) + "</span>");
    if (p.phone) contacts.push("<span>" + escapeHtml(p.phone) + "</span>");
    if (p.email) contacts.push('<span><a href="mailto:' + escapeHtml(p.email) + '">' + escapeHtml(p.email) + "</a></span>");
    if (p.linkedin) contacts.push("<span>" + escapeHtml(p.linkedin) + "</span>");
    if (p.portfolio) contacts.push("<span>" + escapeHtml(p.portfolio) + "</span>");

    var out = "";
    out += '<header class="rp-header">';
    out += '  <h1 class="rp-name">' + escapeHtml(p.fullName || "NAMA LENGKAP") + "</h1>";
    if (p.headline) out += '  <div class="rp-headline">' + escapeHtml(p.headline) + "</div>";
    if (contacts.length) out += '  <div class="rp-contact">' + contacts.join("") + "</div>";
    out += "</header>";

    if (state.summary && state.summary.trim()) {
      out += '<section class="rp-section">';
      out += "  <h2>Profil Profesional</h2>";
      out += '  <p class="rp-text">' + escapeHtml(state.summary) + "</p>";
      out += "</section>";
    }

    if (state.experience && state.experience.length) {
      out += '<section class="rp-section">';
      out += "  <h2>Riwayat Karier</h2>";
      for (var i = 0; i < state.experience.length; i++) {
        var e = state.experience[i];
        if (!e.position && !e.company) continue;
        var endStr = e.current ? "Present" : (e.endDate || "");
        var dateStr = e.startDate || e.endDate
          ? (e.startDate || "") + " - " + (endStr || "")
          : endStr;
        out += '<article class="rp-entry">';
        out += '  <div class="rp-entry-head">';
        out += '    <div><h3 class="rp-role">' + escapeHtml(e.position) + '</h3><div class="rp-org">' + escapeHtml(e.company) + (e.location ? " | " + escapeHtml(e.location) : "") + "</div></div>";
        out += '    <div class="rp-date">' + escapeHtml(dateStr) + "</div>";
        out += "  </div>";
        out += renderBullets(e.description);
        out += "</article>";
      }
      out += "</section>";
    }

    if (state.education && state.education.length) {
      out += '<section class="rp-section">';
      out += "  <h2>Latar Belakang Pendidikan</h2>";
      for (var j = 0; j < state.education.length; j++) {
        var ed = state.education[j];
        if (!ed.institution && !ed.degree) continue;
        out += '<article class="rp-entry">';
        out += '  <div class="rp-entry-head">';
        out += '    <div><h3 class="rp-role">' + escapeHtml(ed.institution) + '</h3><div class="rp-org">' + escapeHtml(ed.degree) + (ed.field ? ", " + escapeHtml(ed.field) : "") + (ed.gpa ? " | IPK: " + escapeHtml(ed.gpa) : "") + "</div></div>";
        out += '    <div class="rp-date">' + escapeHtml(ed.startYear || "") + (ed.endYear ? " - " + escapeHtml(ed.endYear) : "") + "</div>";
        out += "  </div>";
        if (ed.achievements) out += '<p class="rp-text">' + escapeHtml(ed.achievements) + "</p>";
        out += "</article>";
      }
      out += "</section>";
    }

    var hasSkills = (state.skills.hard && state.skills.hard.trim()) || (state.skills.soft && state.skills.soft.trim());
    if (hasSkills) {
      out += '<section class="rp-section">';
      out += "  <h2>Kompetensi &amp; Keahlian</h2>";
      if (state.skills.hard && state.skills.hard.trim()) {
        out += '<p class="rp-skill-line"><strong>Teknis:</strong> ' + escapeHtml(state.skills.hard) + "</p>";
      }
      if (state.skills.soft && state.skills.soft.trim()) {
        out += '<p class="rp-skill-line"><strong>Interpersonal:</strong> ' + escapeHtml(state.skills.soft) + "</p>";
      }
      out += "</section>";
    }

    if (state.projects && state.projects.length) {
      out += '<section class="rp-section">';
      out += "  <h2>Proyek Utama &amp; Kredensial</h2>";
      for (var k = 0; k < state.projects.length; k++) {
        var pr = state.projects[k];
        if (!pr.name) continue;
        out += '<article class="rp-entry">';
        out += '  <div class="rp-entry-head">';
        out += '    <div><h3 class="rp-role">' + escapeHtml(pr.name) + "</h3>" + (pr.issuerOrLink ? '<div class="rp-org">' + escapeHtml(pr.issuerOrLink) + "</div>" : "") + "</div>";
        if (pr.year) out += '    <div class="rp-date">' + escapeHtml(pr.year) + "</div>";
        out += "  </div>";
        if (pr.description) out += '<p class="rp-text">' + escapeHtml(pr.description) + "</p>";
        out += "</article>";
      }
      out += "</section>";
    }

    return out;
  }

  function renderBullets(desc) {
    if (!desc || !desc.trim()) return "";
    var lines = desc.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
    var bullets = [];
    var paragraphs = [];

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (line.indexOf("-") === 0 || line.indexOf("•") === 0 || line.indexOf("*") === 0) {
        bullets.push("<li>" + escapeHtml(line.replace(/^[-•*]\s*/, "")) + "</li>");
      } else {
        paragraphs.push('<p class="rp-text">' + escapeHtml(line) + "</p>");
      }
    }

    var html = "";
    if (paragraphs.length) html += paragraphs.join("");
    if (bullets.length) html += '<ul class="rp-list">' + bullets.join("") + "</ul>";
    return html;
  }

  function renderScore() {
    var scoreBox = document.getElementById("ats-score");
    if (!scoreBox) return;

    var checks = [];
    var score = 0;

    var emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((state.personal.email || "").trim());
    if (state.personal.fullName && state.personal.phone && emailValid) {
      score += 20;
    } else {
      checks.push("Lengkapi nama lengkap, nomor telepon, dan email berformat valid.");
    }

    if (state.personal.headline && state.personal.location) {
      score += 10;
    } else {
      checks.push("Cantumkan target headline posisi dan lokasi kota/negara.");
    }

    var summaryWords = state.summary && state.summary.trim() ? state.summary.trim().split(/\s+/).length : 0;
    if (summaryWords >= 25 && summaryWords <= 120) {
      score += 15;
    } else {
      checks.push("Ringkasan profesional idealnya berbobot 25–120 kata.");
    }

    var validExps = (state.experience || []).filter(function (x) { return x.position && x.company; });
    if (validExps.length >= 1) {
      score += 20;
      var hasMetric = validExps.some(function (e) {
        return /\d+%|\d+\+|\b\d+\b/.test(e.description || "");
      });
      if (hasMetric) {
        score += 10;
      } else {
        checks.push("Sertakan metrik/angka capaian konkret pada poin pengalaman kerja.");
      }
    } else {
      checks.push("Tambahkan minimal 1 riwayat pengalaman kerja terstruktur.");
    }

    var validEdus = (state.education || []).filter(function (ed) { return ed.institution && ed.degree; });
    if (validEdus.length >= 1) {
      score += 15;
    } else {
      checks.push("Tambahkan riwayat institusi dan gelar pendidikan.");
    }

    if (state.skills.hard && state.skills.hard.trim().split(",").length >= 3) {
      score += 10;
    } else {
      checks.push("Tuliskan minimal 3 hard skills relevan (pisahkan koma).");
    }

    score = Math.min(100, score);

    var tipsHtml = checks.length
      ? '<ul class="score-tips">' + checks.map(function (c) { return "<li>" + escapeHtml(c) + "</li>"; }).join("") + "</ul>"
      : '<p class="text-green-700 font-semibold m-0">Skor 100%! Data lengkap, format semantik ATS, siap dikirim.</p>';

    scoreBox.innerHTML =
      '<div class="flex justify-between items-center font-bold"><span>ATS Checklist Meter</span><span>' + score + '%</span></div>' +
      '<div class="score-bar"><div class="score-fill" style="width:' + score + '%"></div></div>' +
      tipsHtml;
  }

  function bindGlobalEvents() {
    var dummyBtn = document.getElementById("dummy-btn");
    if (dummyBtn) {
      dummyBtn.onclick = function () {
        if (!window.DUMMY_RESUME) return;
        state = JSON.parse(JSON.stringify(window.DUMMY_RESUME));
        persistState();
        renderForm();
        renderPreview();
      };
    }

    var resetBtn = document.getElementById("reset-btn");
    if (resetBtn) {
      resetBtn.onclick = function () {
        if (!confirm("Kosongkan semua data CV?")) return;
        state = JSON.parse(JSON.stringify(emptyModel));
        persistState();
        renderForm();
        renderPreview();
      };
    }

    var exportBtn = document.getElementById("export-btn");
    if (exportBtn) {
      exportBtn.onclick = function () {
        var blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = (state.personal.fullName || "cv").toLowerCase().replace(/\s+/g, "_") + "_resume.json";
        a.click();
        URL.revokeObjectURL(url);
      };
    }

    var importBtn = document.getElementById("import-btn");
    var importFile = document.getElementById("import-file");
    if (importBtn && importFile) {
      importBtn.onclick = function () { importFile.click(); };
      importFile.onchange = function (e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (evt) {
          try {
            var parsed = JSON.parse(evt.target.result);
            state = sanitizeState(parsed);
            persistState();
            renderForm();
            renderPreview();
            alert("Data CV berhasil diimpor.");
          } catch (err) {
            alert("File JSON tidak valid.");
          }
          importFile.value = "";
        };
        reader.readAsText(file);
      };
    }

    var printBtn = document.getElementById("print-btn");
    if (printBtn) {
      printBtn.onclick = function () {
        var originalTitle = document.title;
        var safeName = (state.personal.fullName || "Resume").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
        document.title = safeName + "_Resume";
        window.print();
        setTimeout(function () {
          document.title = originalTitle;
        }, 1000);
      };
    }

    var tplSelect = document.getElementById("template-select");
    if (tplSelect) {
      tplSelect.value = state.config.template || "classic";
      tplSelect.onchange = function () {
        state.config.template = tplSelect.value;
        persistState();
        renderPreview();
      };
    }

    var fontSelect = document.getElementById("font-family-select");
    if (fontSelect) {
      fontSelect.value = state.config.fontFamily || "arial";
      fontSelect.onchange = function () {
        state.config.fontFamily = fontSelect.value;
        persistState();
        renderPreview();
      };
    }

    var sizeSelect = document.getElementById("font-size-select");
    if (sizeSelect) {
      sizeSelect.value = state.config.fontSize || "medium";
      sizeSelect.onchange = function () {
        state.config.fontSize = sizeSelect.value;
        persistState();
        renderPreview();
      };
    }

    window.addEventListener("resize", function () {
      updateMobileScale();
    });

    var tabButtons = document.querySelectorAll(".mobile-tabs button");
    var shell = document.querySelector(".app-shell");
    if (tabButtons && shell) {
      tabButtons.forEach(function (btn) {
        btn.onclick = function () {
          tabButtons.forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          var tab = btn.getAttribute("data-tab");
          shell.setAttribute("data-view", tab === "preview-panel" ? "preview" : "editor");
        };
      });
      shell.setAttribute("data-view", "editor");
    }
  }

  function init() {
    renderForm();
    renderPreview();
    bindGlobalEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
