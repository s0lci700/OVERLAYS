<script>
  import { onMount, onDestroy } from "svelte";
  let node;
  let host;
  onMount(() => {
    host = document.createElement("div");
    document.body.appendChild(host);
    host.appendChild(node);
    return () => {
      if (host && host.parentNode) host.parentNode.removeChild(host);
    };
  });
  onDestroy(() => {
    if (host && host.parentNode) host.parentNode.removeChild(host);
  });
</script>

<div bind:this={node}>
  <slot />
</div>
