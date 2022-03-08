package com.opsmx.plugin.stage.custom

import com.netflix.spinnaker.kork.plugins.api.PluginSdks
import com.netflix.spinnaker.orca.api.preconfigured.jobs.PreconfiguredJobConfigurationProvider
import com.netflix.spinnaker.orca.clouddriver.config.KubernetesPreconfiguredJobProperties
import org.pf4j.Extension
import org.pf4j.Plugin
import org.pf4j.PluginWrapper


class TerraformPlanPlugin(wrapper: PluginWrapper): Plugin(wrapper) {

    override fun start() {
        System.out.println("TerraformPlanPlugin.start()")
    }

    override fun stop() {
        System.out.println("TerraformPlanPlugin.stop()")
    }
}

@Extension
class TerraformPlanPreconfiguredStage(val pluginSdks: PluginSdks, val configuration: PluginConfig) : PreconfiguredJobConfigurationProvider {
    override fun getJobConfigurations(): List<KubernetesPreconfiguredJobProperties> {
        val jobProperties = pluginSdks.yamlResourceLoader().loadResource("io/opsmx/plugin/preconfigured/TSPlanJob.yaml", KubernetesPreconfiguredJobProperties::class.java)
        if (!configuration.account.isNullOrEmpty()) {
            jobProperties.account = configuration.account
        }
        if (!configuration.namespace.isNullOrEmpty()) {
            jobProperties.manifest.metadata.namespace = configuration.namespace
        }
        if (!configuration.application.isNullOrEmpty()) {
            jobProperties.application = configuration.application
        }
        return arrayListOf(jobProperties)
    }
}
