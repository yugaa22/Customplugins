package com.opsmx.plugin.stage.custom;

import com.netflix.spinnaker.orca.api.pipeline.graph.StageDefinitionBuilder;
import com.netflix.spinnaker.orca.api.pipeline.graph.TaskNode;
import com.netflix.spinnaker.orca.api.pipeline.models.StageExecution;
import org.jetbrains.annotations.NotNull;
import org.pf4j.Extension;

@Extension
public class Terraform implements StageDefinitionBuilder {

    /**
     * This function describes the sequence of substeps, or "tasks" that comprise this
     * stage. The task graph is generally linear though there are some looping mechanisms.
     * <p>
     * This method is called just before a stage is executed. The task graph can be generated
     * programmatically based on the stage's context.
     */
    @Override
    public void taskGraph(@NotNull StageExecution stage, @NotNull TaskNode.Builder builder) {
        builder.withTask("policy", PolicyTask.class);
    }
}