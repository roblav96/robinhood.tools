<!--  -->
<script lang="ts" src="./app.ts"></script>

<!-- <style lang="scss" src="@/client/styles/styles.scss"></style> -->
<!-- <style lang="css" src="@/client/styles/styles.css"></style> -->

<style>
/**/

</style>

<template>
	<div id="app">

		<v-navbar></v-navbar>

		<router-view></router-view>

		<div class="container grid-xl">
			<div class="section section-hero bg-gray">
				<button class="btn btn-primary">primary button</button>
				<button class="btn btn-success">success button</button>
				<button class="btn btn-error">error button</button>

				<button class="btn btn-action">
					<i class="mdi mdi-bell mdi-24px"></i>
				</button>
			</div>
		</div>

	</div>
</template>
