package com.opsmx.plugin.stage.custom

import com.netflix.spinnaker.kork.plugins.api.PluginConfiguration

@PluginConfiguration("TerraformDestroy.customTSDestroyJobStage")
data class PluginConfig(var account: String?, var namespace: String?, var application: String?)
