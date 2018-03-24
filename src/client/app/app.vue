<!--  -->
<script lang="ts" src="./app.ts"></script>

<style lang="scss" src="@/client/styles/_vendors.scss"></style>
<style lang="scss" src="@/client/styles/_all.scss"></style>
<style lang="css" src="@/client/styles/styles.css"></style>

<style>
/**/

</style>

<template>
	<div id="app" :class="{ 'is-animation-loading': initing === true, 'is-animation fade-in': initing === false }">

		<v-navbar></v-navbar>

		<router-view></router-view>

		<footer class="footer is-bg-dark py-4">
			<div class="container">
				<div class="content has-text-centered mb-2">
					footer
				</div>
				<div class="content has-text-centered">
					<a class="button mt-1" href="https://github.com/roblav96/robinhood.tools" target="_blank">
						<b-icon icon="github-circle" class="" />
						<span>Open Source</span>
					</a>
				</div>
			</div>
		</footer>

	</div>
</template>
