import { createRequire } from "node:module";
import { JSDOM } from "jsdom";
import { format } from "prettier";
import { file } from "./file.js";

class DOMParser {
  parseFromString(string, mimeType = "text/html") {
    if (mimeType !== "text/html") {
      throw new Error(
        `This version of DOMParser only works for "text/html" documents.`
      );
    }
    const dom = new JSDOM(string, { contentType: mimeType });
    const { document } = dom.window;
    document.toString = dom.serialize.bind(dom);
    return document;
  }
}

const Node = {
  // An Element node like <p> or <div>.
  ELEMENT_NODE: 1,
  // An Attribute of an Element.
  ATTRIBUTE_NODE: 2,
  // The actual Text inside an Element or Attr.
  TEXT_NODE: 3,
  // A CDATASection, such as <!CDATA[[ … ]]>
  CDATA_SECTION_NODE: 4,
  // A ProcessingInstruction of an XML document, such as <?xml-stylesheet … ?>.
  PROCESSING_INSTRUCTION_NODE: 7,
  // A Comment node, such as <!-- … -->.
  COMMENT_NODE: 8,
  // A Document node.
  DOCUMENT_NODE: 9,
  // A DocumentType node, such as <!DOCTYPE html>.
  DOCUMENT_TYPE_NODE: 10,
  // A DocumentFragment node.
  DOCUMENT_FRAGMENT_NODE: 11,
};

function htmlIncludes() {
  return {
    name: "vite-plugin-html-includes",
    transformIndexHtml(html, metadata) {
      const document = new DOMParser().parseFromString(html);
      handleIncludes(document, metadata.filename);
      return formatHTML(document.toString());
    },
  }
}

function formatHTML(html) {
  return format(html, { parser: "html" });
}

// Syntax: <link rel="include" href="../includes/head.html"/>
function handleIncludes(node, contextPath) {
  const document = findDocumentFromNode(node);
  const includeLinks = node.querySelectorAll(
    `link[rel="include"][href]`
  );
  
  for (const link of includeLinks) {
    const href = link.getAttribute("href");
    const includePath = createRequire(contextPath).resolve(href);
    const includeHTML = file(includePath);
    const includeContent = element("template", {
      innerHTML: includeHTML,
    }).content;
    
    handleIncludes(includeContent, includePath);
    link.replaceWith(includeContent);
  }
  
  function element(tagName, properties = {}) {
    return Object.assign(document.createElement(tagName), properties);
  }
}

function findDocumentFromNode(node) {
  if (node.nodeType === Node.DOCUMENT_NODE) {
    return node;
  }
  
  if (node.ownerDocument?.nodeType === Node.DOCUMENT_NODE) {
    return node.ownerDocument;
  }
  
  throw new Error("Unable to find document node", {
    node: node,
  });
}

export {
  htmlIncludes,
  DOMParser,
};
