<!--  -->
<script lang="ts" src="./symbol.logo.ts"></script>

<style>
/**/

.v-symbol-logo {}

.v-symbol-logo > img {
	width: 100%;
	vertical-align: center;
}

</style>

<template>
	<figure class="v-symbol-logo image flex">
		<img class="is-png self-center rounded" :src="src" v-on:error="onerror"></img>
	</figure>
</template>
