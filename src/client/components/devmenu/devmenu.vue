<!--  -->
<script lang="ts" src="./devmenu.ts"></script>

<style>
/**/
</style>

<template>
	<b-dropdown hoverable position="is-bottom-left">
		<div class="navbar-item flex items-center h-full" slot="trigger">
			<b-icon class="mx-1" size="is-28x28" icon="developer-board"></b-icon>
		</div>
		<b-dropdown-item custom>
			<span class="font-bold">Developer Menu</span>
		</b-dropdown-item>
		<b-dropdown-item v-on:click="clearstorage()">
			<b-icon icon="delete-forever"></b-icon>
			Clear Storage
		</b-dropdown-item>
	</b-dropdown>
</template>
