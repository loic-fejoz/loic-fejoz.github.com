function loadReferer() {
  document.getElementById("url").value = document.URL;
}

function getXMLHttpRequest() {
  /*  Don't forget to ask for security before to create the object.
      try {
//      netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
      netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
      } catch (e) {
      alert("Permission UniversalBrowserRead denied.");
      }*/
  /* Create a new XMLHttpRequest object to talk to the Web server */
  var xmlHttp = false;
  /*@cc_on @*/
  /*@if (@_jscript_version >= 5)
    try {
    xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
    try {
    xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (e2) {
    xmlHttp = false;
    }
    }
    @end @*/
  
  if (!xmlHttp && typeof XMLHttpRequest != 'undefined') {
    xmlHttp = new XMLHttpRequest();
  }
  return xmlHttp;
}


function RDFXHTMLParser(datasource) {
  this.ds = datasource;
}

RDFXHTMLParser.prototype.parseDOMNode = function (currentNode, uriContext) {
  var context = uriContext;
  /*  try {
      var test = currentNode.hasAttributes();
      } catch (e) {
      alert(currentNode + " - " + e);
      return;
      }*/
  if (currentNode.hasAttributes()) {
    var about = currentNode.getAttribute("about");
    if (about) {
      context = about;
    }
    
    // <a rel="predicate" href="object">...</a>
    //  if (currentNode.nodeType == Node.ELEMENT_NODE) {
    if ((currentNode.nodeName.toLowerCase() == "a") || (currentNode.nodeName.toLowerCase() == "link") ) {
      var rel = currentNode.getAttribute("rel");
      if (rel) {
	var href = currentNode.getAttribute("href");
	this.ds.Assert(this.ds.GetNode(context), this.ds.GetPredicate(rel), this.ds.GetNode(href), true);
      }
      var rev = currentNode.getAttribute("rev");
      if (rev) {
	var href = currentNode.getAttribute("href");
	this.ds.Assert(this.ds.GetNode(href), this.ds.GetPredicate(rev), this.ds.GetNode(context), true);
      }
    }
    //  }
    
    // <elem property="predicate">value></elem>
    var prop = currentNode.getAttribute("property");
    if (prop) {
      var content = currentNode.getAttribute("content");
      if (content) {
	this.ds.Assert(this.ds.GetNode(context), this.ds.GetPredicate(prop),  this.ds.GetLiteral(content), true);
      } else {
	this.ds.Assert(this.ds.GetNode(context), this.ds.GetPredicate(prop),  this.ds.GetLiteral(currentNode.firstChild.nodeValue), true);
      }
    }
  }
  
  /* parse children */
  if (currentNode.hasChildNodes()) {
    var children = currentNode.childNodes;
    for (var i=0; i<children.length; i++) {
      this.parseDOMNode(children[i], context);
    }
  }
};

RDFXHTMLParser.prototype.parseURL = function (url) {
  var parser = this;
  try {
    //netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  } catch (e) {
    //    alert("Permission UniversalBrowserRead denied." + e);
    window.status = e;
  }
  var xmlHttp = getXMLHttpRequest();
  // Open a connection to the server
  xmlHttp.open("GET", url, true);
  //Some versions of some Mozilla browsers won't work properly if the response from the server doesn't have an XML mime-type header.
  xmlHttp.overrideMimeType('text/xml');

  // Setup a function for the server to run when it's done
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == 4) {
      if (xmlHttp.status == 200) {
	try {
	  //netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
	  netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	} catch (e) {
	  //alert("Permission UniversalBrowserRead denied." + e);
	  window.status = e;
	}
	parser.parseDOMNode(xmlHttp.responseXML.documentElement, "");
	parser.ds.Flush();
      } else if (xmlHttp.status == 404) {
	alert("Request URL does not exist");
      } else if (xmlHttp.status == 403) {
	alert("Access denied.");
      } else {
	alert("Error: status code is " + xmlHttp.status + " " + xmlHttp.statusText);
      }
    }
  };

  // Send the request
  xmlHttp.send(null);
};

RDFXHTMLParser.prototype.parseURLWithIFrame = function (url, iframe) {
  var parser = this;
  try {
    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    //netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  } catch (e) {
    //    alert("Permission UniversalBrowserRead denied." + e);
    window.status = e;
  }
  iframe.src = url;
  iframe.onload = function () {
    try {
      netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    } catch (e) {
      alert("Permission UniversalBrowserRead denied.");
    }
    parser.parseDOMNode(iframe.contentDocument.documentElement);
    parser.ds.Flush();
  };
};
  
function DummyDatasource() {
  this.output = "";
};

DummyDatasource.prototype.Assert = function(subject, predicate, object, aBool) {
  this.output += subject + ", " + predicate + ", " + object +"\n";
};

DummyDatasource.prototype.GetLiteral = function (literal) {
  return '"' + literal + '"';
};

DummyDatasource.prototype.GetNode = function (uri) {
  return '<' + uri + '>';
};

DummyDatasource.prototype.GetPredicate = function (uri) {
  return '<' + uri + '>';
};


DummyDatasource.prototype.Flush = function () {
  if (this.output) {
    alert(this.output);
  } else {
    alert("no triples");
  }
};

function TableDatasource(table) {
  this.table = table;
  var trs = table.childNodes;
  for(var i=0; i<trs.length; i++) {
    table.removeChild(trs[i]);
  }
  /* Do not know why we need this! */
  if (table.firstChild) {
    table.removeChild(table.firstChild);
  }
};

TableDatasource.prototype.Assert = function(subject, predicate, object, aBool) {
  var tr = this.table.insertRow(-1);
  var td = tr.insertCell(0);
  td.innerHTML = subject;
  td = tr.insertCell(1);
  td.innerHTML = predicate;
  td = tr.insertCell(2);
  td.innerHTML = object;
};

TableDatasource.prototype.GetLiteral = function (literal) {
  return '"' + literal + '"';
};

TableDatasource.prototype.GetNode = function (uri) {
  return '&lt;' + uri + '&gt;';
};

TableDatasource.prototype.GetPredicate = function (uri) {
  return '&lt;' + uri + '&gt;';
};


TableDatasource.prototype.Flush = function () {
};



function showMyself() {
  var ds = new DummyDatasource();
  var parser = new RDFXHTMLParser(ds);
  parser.parseDOMNode(document.documentElement, "");
  ds.Flush();
};

function showUrlTriple() {
  var ds = new TableDatasource(document.getElementById("rdftable"));
  var parser = new RDFXHTMLParser(ds);
  parser.parseURL(document.getElementById("url").value);
}

function showUrlTripleWithIFrame() {
  var ds = new TableDatasource(document.getElementById("rdftable"));
  var parser = new RDFXHTMLParser(ds);
  parser.parseURLWithIFrame(document.getElementById("url").value, document.getElementById("rdfiframe"));
}
