<!--  -->
<script lang="ts" src="./symbol.logo.ts"></script>

<style>
/**/

.ui-symbol-logo {}

.ui-symbol-logo > img {
	width: 100%;
	vertical-align: center;
}

</style>

<template>
	<figure class="ui-symbol-logo image flex">
		<img class="is-png self-center rounded" :src="src" v-on:error="onerror"></img>
	</figure>
</template>
