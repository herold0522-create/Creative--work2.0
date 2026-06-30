(function () {
  const ROLE_KEY = "dc-auth-role";
  const NAME_KEY = "dc-auth-name";
  const root = document.documentElement;

  function currentRole() {
    return localStorage.getItem(ROLE_KEY) || "";
  }

  function currentName() {
    return localStorage.getItem(NAME_KEY) || "";
  }

  function setRole(role, name) {
    const displayName = name.trim() || (role === "admin" ? "好创意管理员" : "好创意用户");
    localStorage.setItem(ROLE_KEY, role);
    localStorage.setItem(NAME_KEY, displayName);
    window.__dcRole = role;
    window.__dcAuthName = displayName;
    root.classList.remove("dc-auth-locked");
    removeLogin();
    renderBadge();
    applyVisibleIdentity();
  }

  function clearRole() {
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(NAME_KEY);
    window.__dcRole = "";
    window.__dcAuthName = "";
  }

  function removeLogin() {
    const shell = document.querySelector(".dc-login-shell");
    if (shell) shell.remove();
  }

  function renderBadge() {
    const role = currentRole();
    const previous = document.querySelector(".dc-role-badge");
    if (!role) return;
    const label = role === "admin" ? "管理员端" : "用户端";
    if (previous) {
      if (previous.textContent !== label) previous.textContent = label;
      return;
    }

    const badge = document.createElement("div");
    badge.className = "dc-role-badge";
    badge.textContent = label;
    document.body.appendChild(badge);
  }

  function applyVisibleIdentity() {
    const role = currentRole();
    const name = currentName() || (role === "admin" ? "好创意管理员" : "好创意用户");
    const legacyShort = "\u798f\u5927\u81f3\u8bda";
    const legacyFull = "\u798f\u5dde\u5927\u5b66\u81f3\u8bda\u5b66\u9662";
    const legacyCore = "\u81f3\u8bda";
    if (!role) return;

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (node.nodeValue.includes("好创意用户") && role === "admin") {
        node.nodeValue = node.nodeValue.replaceAll("好创意用户", name);
      }
      if (node.nodeValue.includes(legacyShort)) {
        node.nodeValue = node.nodeValue.replaceAll(legacyShort, "好创意");
      }
      if (node.nodeValue.includes(legacyFull)) {
        node.nodeValue = node.nodeValue.replaceAll(legacyFull, "好创意大学");
      }
      if (node.nodeValue.includes(legacyCore)) {
        node.nodeValue = node.nodeValue.replaceAll(legacyCore, "好创意");
      }
    });
  }

  function showLogin() {
    if (currentRole()) {
      root.classList.remove("dc-auth-locked");
      renderBadge();
      applyVisibleIdentity();
      return;
    }

    root.classList.add("dc-auth-locked");
    removeLogin();

    let role = "user";
    const shell = document.createElement("div");
    shell.className = "dc-login-shell";
    shell.innerHTML = [
      '<section class="dc-login-panel" aria-label="登录">',
      '  <div class="dc-login-brand">',
      '    <h1>同频<span style="color:#a78bfa">.</span></h1>',
      '    <p>好创意大学数字文化社区</p>',
      "  </div>",
      '  <div class="dc-login-tabs" role="tablist">',
      '    <button class="dc-login-tab is-active" type="button" data-role="user">用户端</button>',
      '    <button class="dc-login-tab" type="button" data-role="admin">管理员端</button>',
      "  </div>",
      '  <form class="dc-login-form">',
      '    <label class="dc-login-field">',
      "      <span>登录名称</span>",
      '      <input class="dc-login-input" name="name" autocomplete="name" placeholder="好创意用户" />',
      "    </label>",
      '    <button class="dc-login-submit" type="submit">进入用户端</button>',
      "  </form>",
      "</section>"
    ].join("");

    const tabs = shell.querySelectorAll(".dc-login-tab");
    const input = shell.querySelector(".dc-login-input");
    const submit = shell.querySelector(".dc-login-submit");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        role = tab.dataset.role;
        tabs.forEach((item) => item.classList.toggle("is-active", item === tab));
        input.placeholder = role === "admin" ? "好创意管理员" : "好创意用户";
        submit.textContent = role === "admin" ? "进入管理员端" : "进入用户端";
      });
    });

    shell.querySelector(".dc-login-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const activeRole = shell.querySelector(".dc-login-tab.is-active")?.dataset.role || role;
      setRole(activeRole, input.value);
    });

    document.body.appendChild(shell);
  }

  window.__dcRole = currentRole();
  window.__dcAuthName = currentName();

  if (new URLSearchParams(window.location.search).has("resetAuth")) {
    clearRole();
  }

  document.addEventListener(
    "click",
    (event) => {
      const button = event.target.closest && event.target.closest("button");
      if (!button) return;
      if (!button.textContent.includes("退出登录")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      clearRole();
      window.location.reload();
    },
    true
  );

  const observer = new MutationObserver(() => {
    renderBadge();
    applyVisibleIdentity();
  });

  window.addEventListener("DOMContentLoaded", () => {
    showLogin();
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  });
})();
