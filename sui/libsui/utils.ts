function $Store(elm) {
  if (!elm) {
    return null;
  }

  if (typeof elm === "string") {
    elm = document.querySelectorAll(elm);
    if (elm.length == 0) {
      return null;
    }
    elm = elm[0];
  }
  // @ts-ignore
  return new __sui_store(elm);
}

function $Query(selector: string): __Query {
  return new __Query(selector);
}

class __Query {
  selector: string | Element = "";
  elements: NodeListOf<Element> | null = null;
  element: Element | null = null;
  constructor(selector: string | Element) {
    if (typeof selector === "string") {
      this.selector = selector;
      this.elements = document.querySelectorAll(selector);
      if (this.elements.length > 0) {
        this.element = this.elements[0];
      }
    } else {
      this.element = selector;
    }
    this.selector = selector;
  }

  elm(): Element | null {
    return this.element;
  }

  elms(): NodeListOf<Element> | null {
    return this.elements;
  }

  $$() {
    if (!this.element) {
      return null;
    }
    const root = this.element.closest("[s\\:cn]");
    if (!root) {
      return null;
    }

    // @ts-ignore
    return $$(root);
  }

  each(callback: (element: __Query, index: number) => void) {
    if (!this.elements) {
      return;
    }
    this.elements.forEach((element, index) => {
      callback(new __Query(element), index);
    });
    return;
  }

  store() {
    if (!this.element || typeof this.element.getAttribute !== "function") {
      return null;
    }

    // @ts-ignore
    return new __sui_store(this.element);
  }

  attr(key) {
    if (!this.element || typeof this.element.getAttribute !== "function") {
      return null;
    }
    return this.element.getAttribute(key);
  }

  data(key) {
    if (!this.element || typeof this.element.getAttribute !== "function") {
      return null;
    }
    return this.element.getAttribute("data:" + key);
  }

  json(key) {
    if (!this.element || typeof this.element.getAttribute !== "function") {
      return null;
    }
    const v = this.element.getAttribute("json:" + key);
    if (!v) {
      return null;
    }
    try {
      return JSON.parse(v);
    } catch (e) {
      console.error(`Error parsing JSON for key ${key}: ${e}`);
      return null;
    }
  }

  hasClass(className) {
    return this.element?.classList.contains(className);
  }

  prop(key) {
    if (!this.element || typeof this.element.getAttribute !== "function") {
      return null;
    }
    const k = "prop:" + key;
    const v = this.element.getAttribute(k);
    const json = this.element.getAttribute("json-attr-prop:" + key) === "true";
    if (json && v) {
      try {
        return JSON.parse(v);
      } catch (e) {
        console.error(`Error parsing JSON for prop ${key}: ${e}`);
        return null;
      }
    }
    return v;
  }

  removeClass(className) {
    const classes = Array.isArray(className) ? className : className.split(" ");
    classes.forEach((c) => {
      const v = c.replace(/[\n\r\s]/g, "");
      if (v === "") return;
      this.element?.classList.remove(v);
    });
    return this;
  }

  addClass(className) {
    const classes = Array.isArray(className) ? className : className.split(" ");
    classes.forEach((c) => {
      const v = c.replace(/[\n\r\s]/g, "");
      if (v === "") return;
      this.element?.classList.add(v);
    });
    return this;
  }

  html(html?: string): __Query | string {
    if (html === undefined) {
      return this.element?.innerHTML || "";
    }
    if (this.element) {
      this.element.innerHTML = html;
    }
    return this;
  }
}

function $Render(comp, option): __Render {
  const r = new __Render(comp, option);
  return r;
}

class __Render {
  comp = null;
  option = null;
  constructor(comp, option) {
    this.comp = comp;
    this.option = option;
  }
  async Exec(name, data): Promise<string> {
    // @ts-ignore
    return __sui_render(this.comp, name, data, this.option);
  }
}

function $Backend(route?: string) {
  const page = window.location.pathname;
  const root = document.body.getAttribute("s:public") || "/";
  route = route || page;
  const re = new RegExp("^" + root);
  route = root + route.replace(re, "");
  return new __Backend(route, page);
}

class __Backend {
  route = "";
  page = "";
  constructor(route: string, page: string) {
    this.route = route;
    this.page = page;
  }

  async Call(method: string, ...args: any): Promise<any> {
    // @ts-ignore
    return await __sui_backend_call(this.route, this.page, method, ...args);
  }
}
