## Modules

<dl>
<dt><a href="#periodicjs.ext.module_admin">admin</a></dt>
<dd><p>An authentication extension that uses passport to authenticate user sessions.</p>
</dd>
<dt><a href="#module_authController">authController</a> ⇒ <code>object</code></dt>
<dd><p>admin controller</p>
</dd>
<dt><a href="#module_settingsController">settingsController</a> ⇒ <code>object</code></dt>
<dd><p>settings controller</p>
</dd>
<dt><a href="#module_authController">authController</a> ⇒ <code>object</code></dt>
<dd><p>admin controller</p>
</dd>
<dt><a href="#module_userroleController">userroleController</a> ⇒ <code>object</code></dt>
<dd><p>user role controller</p>
</dd>
<dt><a href="#module_authController">authController</a> ⇒ <code>object</code></dt>
<dd><p>admin controller</p>
</dd>
<dt><a href="#module_authController">authController</a> ⇒ <code>object</code></dt>
<dd><p>admin controller</p>
</dd>
<dt><a href="#module_authController">authController</a> ⇒ <code>object</code></dt>
<dd><p>admin controller</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#sendSettingEmail">sendSettingEmail(options, callbackk)</a></dt>
<dd><p>send setting update email</p>
</dd>
<dt><a href="#restart_app">restart_app(req, res)</a> ⇒ <code>object</code></dt>
<dd><p>restarts application response handler and send notification email</p>
</dd>
<dt><a href="#update_app">update_app(req, res)</a> ⇒ <code>object</code></dt>
<dd><p>placeholder response for updating application</p>
</dd>
<dt><a href="#load_extension_settings">load_extension_settings(req, res, next)</a></dt>
<dd><p>load the extensions configuration files from the installed config folder in content/config/extensions/[extension]/[config files]</p>
</dd>
<dt><a href="#update_theme_filedata">update_theme_filedata(req, res)</a></dt>
<dd><p>save data from theme page post</p>
</dd>
<dt><a href="#update_ext_filedata">update_ext_filedata(req, res)</a></dt>
<dd><p>save data from config page post</p>
</dd>
<dt><a href="#load_app_settings">load_app_settings(req, res, next)</a> ⇒ <code>object</code></dt>
<dd><p>load app configuration information</p>
</dd>
<dt><a href="#load_theme_settings">load_theme_settings(req, res, next)</a> ⇒ <code>object</code></dt>
<dd><p>load theme configuration information</p>
</dd>
<dt><a href="#update_app_settings">update_app_settings(req, res, next)</a> ⇒ <code>object</code></dt>
<dd><p>form upload handler to update app settings, and sends notification email</p>
</dd>
<dt><a href="#update_theme_settings">update_theme_settings(req, res, next)</a> ⇒ <code>object</code></dt>
<dd><p>form upload handler to update theme settings, and sends notification email</p>
</dd>
<dt><a href="#update_config_json_files">update_config_json_files(req, res, next)</a> ⇒ <code>object</code></dt>
<dd><p>form upload handler to update theme settings, and sends notification email</p>
</dd>
<dt><a href="#get_index_page">get_index_page(req, res)</a> ⇒ <code>object</code></dt>
<dd><p>shows list of users page</p>
</dd>
<dt><a href="#get_show_page">get_show_page(req, res)</a> ⇒ <code>object</code></dt>
<dd><p>shows user profile page</p>
</dd>
<dt><a href="#get_new_page">get_new_page(req, res)</a> ⇒ <code>object</code></dt>
<dd><p>create a new user page</p>
</dd>
<dt><a href="#get_edit_page">get_edit_page(req, res)</a> ⇒ <code>function</code></dt>
<dd><p>make sure a user is authenticated, if not logged in, send them to login page and return them to original resource after login</p>
</dd>
<dt><a href="#index">index(req, res)</a> ⇒ <code>object</code></dt>
<dd><p>manage user role section</p>
</dd>
<dt><a href="#userrole_new">userrole_new(req, res)</a> ⇒ <code>object</code></dt>
<dd><p>create a new usr role</p>
</dd>
<dt><a href="#show">show(req, res)</a> ⇒ <code>object</code></dt>
<dd><p>show user role</p>
</dd>
<dt><a href="#getMarkdownReleases">getMarkdownReleases(req, res)</a> ⇒ <code>object</code></dt>
<dd><p>load the markdown release data</p>
</dd>
<dt><a href="#getHomepageStats">getHomepageStats(req, res)</a> ⇒ <code>object</code></dt>
<dd><p>does a query to get content counts for all content types</p>
</dd>
<dt><a href="#settings_index">settings_index(req, res)</a> ⇒ <code>object</code></dt>
<dd><p>application settings and theme settings page</p>
</dd>
<dt><a href="#settings_faq">settings_faq(req, res)</a> ⇒ <code>object</code></dt>
<dd><p>settings faq page</p>
</dd>
</dl>

<a name="periodicjs.ext.module_admin"></a>

## admin
An authentication extension that uses passport to authenticate user sessions.

**Requires**: <code>module:passport</code>  
**{@link**: https://github.com/typesettin/periodicjs.ext.admin}  
**Author:** Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2014 Typesettin. All rights reserved.  

| Param | Type | Description |
| --- | --- | --- |
| periodic | <code>object</code> | variable injection of resources from current periodic instance |

<a name="module_authController"></a>

## authController ⇒ <code>object</code>
admin controller

**Requires**: <code>module:periodicjs.core.utilities</code>, <code>module:periodicjs.core.controller</code>, <code>module:periodicjs.core.extensions</code>  
**{@link**: https://github.com/typesettin/periodic}  
**Author:** Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2014 Typesettin. All rights reserved.  

| Param | Type | Description |
| --- | --- | --- |
| resources | <code>object</code> | variable injection from current periodic instance with references to the active logger and mongo session |

<a name="module_settingsController"></a>

## settingsController ⇒ <code>object</code>
settings controller

**Returns**: <code>object</code> - settings  
**Requires**: <code>module:async</code>, <code>module:path</code>, <code>module:string-to-json</code>, <code>module:utils-merge</code>, <code>module:ejs</code>, <code>module:periodicjs.core.utilities</code>, <code>module:periodicjs.core.controller</code>, <code>module:periodicjs.core.mailer</code>  
**{@link**: https://github.com/typesettin/periodicjs.ext.admin}  
**Author:** Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2014 Typesettin. All rights reserved.  

| Param | Type | Description |
| --- | --- | --- |
| resources | <code>object</code> | variable injection from current periodic instance with references to the active logger and mongo session |

<a name="module_authController"></a>

## authController ⇒ <code>object</code>
admin controller

**Requires**: <code>module:periodicjs.core.utilities</code>, <code>module:periodicjs.core.controller</code>, <code>module:periodicjs.core.extensions</code>  
**{@link**: https://github.com/typesettin/periodic}  
**Author:** Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2014 Typesettin. All rights reserved.  

| Param | Type | Description |
| --- | --- | --- |
| resources | <code>object</code> | variable injection from current periodic instance with references to the active logger and mongo session |

<a name="module_userroleController"></a>

## userroleController ⇒ <code>object</code>
user role controller

**Returns**: <code>object</code> - userlogin  
**Requires**: <code>module:periodicjs.core.utilities</code>, <code>module:periodicjs.core.controller</code>  
**{@link**: https://github.com/typesettin/periodicjs.ext.user_access_control}  
**Author:** Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2014 Typesettin. All rights reserved.  

| Param | Type | Description |
| --- | --- | --- |
| resources | <code>object</code> | variable injection from current periodic instance with references to the active logger and mongo session |

<a name="module_authController"></a>

## authController ⇒ <code>object</code>
admin controller

**Requires**: <code>module:periodicjs.core.utilities</code>, <code>module:periodicjs.core.controller</code>, <code>module:periodicjs.core.extensions</code>  
**{@link**: https://github.com/typesettin/periodic}  
**Author:** Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2014 Typesettin. All rights reserved.  

| Param | Type | Description |
| --- | --- | --- |
| resources | <code>object</code> | variable injection from current periodic instance with references to the active logger and mongo session |

<a name="module_authController"></a>

## authController ⇒ <code>object</code>
admin controller

**Requires**: <code>module:periodicjs.core.utilities</code>, <code>module:periodicjs.core.controller</code>, <code>module:periodicjs.core.extensions</code>  
**{@link**: https://github.com/typesettin/periodic}  
**Author:** Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2014 Typesettin. All rights reserved.  

| Param | Type | Description |
| --- | --- | --- |
| resources | <code>object</code> | variable injection from current periodic instance with references to the active logger and mongo session |

<a name="module_authController"></a>

## authController ⇒ <code>object</code>
admin controller

**Requires**: <code>module:periodicjs.core.utilities</code>, <code>module:periodicjs.core.controller</code>, <code>module:periodicjs.core.extensions</code>  
**{@link**: https://github.com/typesettin/periodic}  
**Author:** Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2014 Typesettin. All rights reserved.  

| Param | Type | Description |
| --- | --- | --- |
| resources | <code>object</code> | variable injection from current periodic instance with references to the active logger and mongo session |

<a name="sendSettingEmail"></a>

## sendSettingEmail(options, callbackk)
send setting update email

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | contains email options and nodemailer transport |
| callbackk | <code>function</code> | async callback |

<a name="restart_app"></a>

## restart_app(req, res) ⇒ <code>object</code>
restarts application response handler and send notification email

**Kind**: global function  
**Returns**: <code>object</code> - reponds with an error page or sends user to authenicated in resource  

| Param | Type |
| --- | --- |
| req | <code>object</code> | 
| res | <code>object</code> | 

<a name="update_app"></a>

## update_app(req, res) ⇒ <code>object</code>
placeholder response for updating application

**Kind**: global function  
**Returns**: <code>object</code> - reponds with an error page or sends user to authenicated in resource  

| Param | Type |
| --- | --- |
| req | <code>object</code> | 
| res | <code>object</code> | 

<a name="load_extension_settings"></a>

## load_extension_settings(req, res, next)
load the extensions configuration files from the installed config folder in content/config/extensions/[extension]/[config files]

**Kind**: global function  

| Param | Type |
| --- | --- |
| req | <code>object</code> | 
| res | <code>object</code> | 
| next | <code>function</code> | 

<a name="load_extension_settings..loadconfigfiles"></a>

### load_extension_settings~loadconfigfiles(callback) ⇒ <code>array</code>
load config files into array of filejson

**Kind**: inner method of <code>[load_extension_settings](#load_extension_settings)</code>  
**Returns**: <code>array</code> - array of file data objects  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | async callbackk |

<a name="update_theme_filedata"></a>

## update_theme_filedata(req, res)
save data from theme page post

**Kind**: global function  

| Param | Type |
| --- | --- |
| req | <code>object</code> | 
| res | <code>object</code> | 

<a name="update_ext_filedata"></a>

## update_ext_filedata(req, res)
save data from config page post

**Kind**: global function  

| Param | Type |
| --- | --- |
| req | <code>object</code> | 
| res | <code>object</code> | 

<a name="load_app_settings"></a>

## load_app_settings(req, res, next) ⇒ <code>object</code>
load app configuration information

**Kind**: global function  
**Returns**: <code>object</code> - reponds with an error page or sends user to authenicated in resource  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> |  |
| res | <code>object</code> |  |
| next | <code>object</code> | async callback |

<a name="load_theme_settings"></a>

## load_theme_settings(req, res, next) ⇒ <code>object</code>
load theme configuration information

**Kind**: global function  
**Returns**: <code>object</code> - reponds with an error page or sends user to authenicated in resource  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> |  |
| res | <code>object</code> |  |
| next | <code>object</code> | async callback |

<a name="update_app_settings"></a>

## update_app_settings(req, res, next) ⇒ <code>object</code>
form upload handler to update app settings, and sends notification email

**Kind**: global function  
**Returns**: <code>object</code> - reponds with an error page or sends user to authenicated in resource  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> |  |
| res | <code>object</code> |  |
| next | <code>object</code> | async callback |

<a name="update_theme_settings"></a>

## update_theme_settings(req, res, next) ⇒ <code>object</code>
form upload handler to update theme settings, and sends notification email

**Kind**: global function  
**Returns**: <code>object</code> - reponds with an error page or sends user to authenicated in resource  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> |  |
| res | <code>object</code> |  |
| next | <code>object</code> | async callback |

<a name="update_config_json_files"></a>

## update_config_json_files(req, res, next) ⇒ <code>object</code>
form upload handler to update theme settings, and sends notification email

**Kind**: global function  
**Returns**: <code>object</code> - reponds with an error page or sends user to authenicated in resource  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> |  |
| res | <code>object</code> |  |
| next | <code>object</code> | async callback |

<a name="get_index_page"></a>

## get_index_page(req, res) ⇒ <code>object</code>
shows list of users page

**Kind**: global function  
**Returns**: <code>object</code> - reponds with an error page or sends user to authenicated in resource  

| Param | Type |
| --- | --- |
| req | <code>object</code> | 
| res | <code>object</code> | 

<a name="get_show_page"></a>

## get_show_page(req, res) ⇒ <code>object</code>
shows user profile page

**Kind**: global function  
**Returns**: <code>object</code> - reponds with an error page or sends user to authenicated in resource  

| Param | Type |
| --- | --- |
| req | <code>object</code> | 
| res | <code>object</code> | 

<a name="get_new_page"></a>

## get_new_page(req, res) ⇒ <code>object</code>
create a new user page

**Kind**: global function  
**Returns**: <code>object</code> - reponds with an error page or sends user to authenicated in resource  

| Param | Type |
| --- | --- |
| req | <code>object</code> | 
| res | <code>object</code> | 

<a name="get_edit_page"></a>

## get_edit_page(req, res) ⇒ <code>function</code>
make sure a user is authenticated, if not logged in, send them to login page and return them to original resource after login

**Kind**: global function  
**Returns**: <code>function</code> - next() callback  

| Param | Type |
| --- | --- |
| req | <code>object</code> | 
| res | <code>object</code> | 

<a name="index"></a>

## index(req, res) ⇒ <code>object</code>
manage user role section

**Kind**: global function  
**Returns**: <code>object</code> - reponds with an error page or requested view  

| Param | Type |
| --- | --- |
| req | <code>object</code> | 
| res | <code>object</code> | 

<a name="userrole_new"></a>

## userrole_new(req, res) ⇒ <code>object</code>
create a new usr role

**Kind**: global function  
**Returns**: <code>object</code> - reponds with an error page or requested view  

| Param | Type |
| --- | --- |
| req | <code>object</code> | 
| res | <code>object</code> | 

<a name="show"></a>

## show(req, res) ⇒ <code>object</code>
show user role

**Kind**: global function  
**Returns**: <code>object</code> - reponds with an error page or requested view  

| Param | Type |
| --- | --- |
| req | <code>object</code> | 
| res | <code>object</code> | 

<a name="getMarkdownReleases"></a>

## getMarkdownReleases(req, res) ⇒ <code>object</code>
load the markdown release data

**Kind**: global function  
**Returns**: <code>object</code> - reponds with an error page or sends user to authenicated in resource  

| Param | Type |
| --- | --- |
| req | <code>object</code> | 
| res | <code>object</code> | 

<a name="getHomepageStats"></a>

## getHomepageStats(req, res) ⇒ <code>object</code>
does a query to get content counts for all content types

**Kind**: global function  
**Returns**: <code>object</code> - reponds with an error page or sends user to authenicated in resource  

| Param | Type |
| --- | --- |
| req | <code>object</code> | 
| res | <code>object</code> | 

<a name="settings_index"></a>

## settings_index(req, res) ⇒ <code>object</code>
application settings and theme settings page

**Kind**: global function  
**Returns**: <code>object</code> - reponds with an error page or sends user to authenicated in resource  

| Param | Type |
| --- | --- |
| req | <code>object</code> | 
| res | <code>object</code> | 

<a name="settings_faq"></a>

## settings_faq(req, res) ⇒ <code>object</code>
settings faq page

**Kind**: global function  
**Returns**: <code>object</code> - reponds with an error page or sends user to authenicated in resource  

| Param | Type |
| --- | --- |
| req | <code>object</code> | 
| res | <code>object</code> | 

