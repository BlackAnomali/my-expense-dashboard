<template>
  <SidebarInset>
    <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger class="-ml-1" />
      <Separator
        orientation="vertical"
        class="mr-2 data-[orientation=vertical]:h-4"
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem class="hidden md:block">
            <BreadcrumbLink href="#">
              {{ title }}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
    <div class="flex flex-1 flex-col gap-4 p-4">
      <slot></slot>
      <PwaInstall />
    </div>
  </SidebarInset>
</template>

<script lang="ts">
export const iframeHeight = "800px";
export const description =
  "A simple sidebar with navigation grouped by section.";
</script>
<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type PwaInstallVue from "./PwaInstall.vue";

const props = defineProps<{
  title: string;
}>();
</script>
