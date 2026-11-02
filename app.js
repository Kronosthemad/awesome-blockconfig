// app.js
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: document.getElementById('toolbox')
});

// Define Keybinding Block
Blockly.Blocks['awesome_keybinding'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("On Key")
        .appendField(new Blockly.FieldDropdown([["Mod4 (Super)", "Mod4"], ["Control", "Control"], ["Shift", "Shift"], ["Mod1 (Alt)", "Mod1"]]), "MOD")
        .appendField("+")
        .appendField(new Blockly.FieldTextInput("Return"), "KEY")
        .appendFeild(new Blockly.FieldTextInput("Return"), "DSC")
        .appendFeild(new Blockly.FieldTextInput("Return"), "GRP");
    this.appendStatementInput("ACTION")
        .setCheck(null)
        .appendField("do");
    this.setColour(230);
    this.setTooltip("Binds a key combination to an action.");
  }
};

// Define Lua Code Generator for Keybinding
javascriptGenerator.forBlock['awesome_keybinding'] = function(block, generator) {
  const mod = block.getFieldValue('MOD');
  const key = block.getFieldValue('KEY');
  const description = block.getFieldValue('DSC');
  const group = block.getFieldValue('GRP');
  const branch = generator.statementToCode(block, 'ACTION');
  
  return `awful.key({ "${mod}" }, "${key}", function (c) ${branch}end\n { description = ${description}, group = ${group}),\n`;
};

// Define Spawn Block
Blockly.Blocks['awesome_spawn'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("spawn command")
        .appendField(new Blockly.FieldTextInput("alacritty"), "CMD");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};

javascriptGenerator.forBlock['awesome_spawn'] = function(block, generator) {
  const cmd = block.getFieldValue('CMD');
  return `awful.spawn("${cmd}")\n`;
};

Blockly.Blocks['awesome_client_rule'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Rule for Class")
        .appendField(new Blockly.FieldTextInput("Steam"), "CLASS");
    this.appendDummyInput()
        .appendField("Set Floating")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "FLOATING");
    this.appendDummyInput()
        .appendField("Assign to Tag")
        .appendField(new Blockly.FieldTextInput("5"), "TAG");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Applies properties (floating, target tag) to windows matching a specific WM class.");
  }
};

javascriptGenerator.forBlock['awesome_client_rule'] = function(block, generator) {
  const className = block.getFieldValue('CLASS');
  const isFloating = block.getFieldValue('FLOATING') === 'TRUE';
  const tag = block.getFieldValue('TAG').trim();

  let properties = [];
  properties.push(`floating = ${isFloating}`);
  
  if (tag.length > 0) {
    properties.push(`tag = "${tag}"`);
  }

  const code = 
    `{\n` +
    `  rule = { class = "${className}" },\n` +
    `  properties = { ${properties.join(', ')} }\n` +
    `},\n`;

  return code;
};

function generateAwesomeRulesConfig(workspace) {
  const rulesCode = javascriptGenerator.workspaceToCode(workspace);
  
  return `local awful = require("awful")\n` +
         `awful.rules.rules = {\n` +
         `  -- Default rule for all clients\n` +
         `  {\n` +
         `    rule = { },\n` +
         `    properties = {\n` +
         `      border_width = 2,\n` +
         `      focus = awful.client.focus.filter,\n` +
         `      raise = true,\n` +
         `      screen = awful.screen.preferred,\n` +
         `      placement = awful.placement.no_overlap+awful.placement.no_offscreen\n` +
         `    }\n` +
         `  },\n` +
         `  -- Custom generated blocks\n` +
         rulesCode +
         `}\n`;
}


// Live update output text
function updateCode() {
  const code = javascriptGenerator.workspaceToCode(workspace);
  document.getElementById('codeOutput').value = code;
}
workspace.addChangeListener(updateCode);