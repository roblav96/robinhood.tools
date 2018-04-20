<!--  -->
<script lang="ts" src="./app.ts"></script>

<style>
/**/

</style>

<template>
	<div id="app">

		<v-navbar></v-navbar>

		<router-view></router-view>

		<div class="section">
			<div class="container grid-lg">
				<div class="section section-hero bg-gray">
					<button class="btn btn-primary">primary button</button>
					<button class="btn btn-success">success button</button>
					<button class="btn btn-error">error button</button>
<progress class="progress" min="90" max="100"></progress>
					<button class="btn btn-action">
						<i class="mdi mdi-bell mdi-24px"></i>
					</button>
				</div>
			</div>
		</div>

	</div>
</template>
