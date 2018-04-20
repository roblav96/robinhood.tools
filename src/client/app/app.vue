<!--  -->
<script lang="ts" src="./app.ts"></script>

<style>
/**/

</style>

<template>
	<div id="app">

		<v-navbar></v-navbar>

		<router-view></router-view>

		<footer class="footer py-4">
			<div class="container">
				<div class="content has-text-centered">
					<a class="button" href="https://github.com/roblav96/robinhood.tools" target="_blank">
						<b-icon icon="github-circle" />
						<span>Open Source</span>
					</a>
				</div>
			</div>
		</footer>

	</div>
</template>
