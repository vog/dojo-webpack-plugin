/*
 * (C) Copyright IBM Corp. 2012, 2016 All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var path = require("path");
var loaderUtils = require("loader-utils");

module.exports = function(content) {
	this.cacheable && this.cacheable();
	var dojoRequire = this._compiler.applyPluginsBailResult("get dojo require");
	var query = loaderUtils.parseQuery(this.query);
	var loader = query.loader;
	if (!loader) {
		throw new Error("No loader specified");
	}
	var name = this._module.absMid.split("!").pop();
	var deps = query.deps ? query.deps.split(",") : [];
	var issuer = this._module.issuer;
	if (issuer) {
		issuerAbsMid = this._compilation.findModule(issuer).absMid;
	}
	if (!issuerAbsMid) {
		issuerAbsMid = this._module.absMid || "";
	}
	var buf = [];
	var runner = require.resolve("./runner.js").replace(/\\/g, "/");
	buf.push("var runner = require(\"" + runner + "\");");
	buf.push("var loader = require(\"" + loader + "?absMid=" + loader + "\");");
	deps.forEach(function(dep) {
		dep = decodeURIComponent(dep);
		dep = dep.split("!").map(function(segment) {
			return dojoRequire.toAbsMid(segment, issuerAbsMid);
		}).join("!");
		buf.push("require(\"" + dep + "?absMid=" + dep.replace(/\!/g, "%21") + "\");")
	});
	buf.push("module.exports = runner(loader,\"" + name + "\");");
	return buf.join("\n");
};