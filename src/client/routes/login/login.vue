<!--  -->
<script lang="ts" src="./login.ts"></script>

<style>
/**/

</style>

<template>
	<section class="section is-medium">
		<div class="container">
			<div class="columns is-mobile justify-center">
				<div class="column is-narrow">
					<form class="box" style="max-width: 335px;" v-on:submit.prevent="submit">
						<figure class="image mb-4 w-2/3">
							<img src="../../../assets/robinhood-banner.png">
						</figure>
						<b-field class="mb-2" label="Email or Username">
							<b-input ref="username_input" type="text" icon="account" v-model="username" required :disabled="busy || ismfa"></b-input>
						</b-field>
						<b-field class="mb-4" label="Password">
							<b-input type="password" icon="lock" v-model="password" password-reveal required :disabled="busy || ismfa"></b-input>
						</b-field>
						<v-grecaptcha v-if="!ishuman" class="mb-4"></v-grecaptcha>
						<b-field v-show="ismfa" class="mb-4" label="Two-Factor Authentication">
							<b-input ref="mfa_input" type="number" icon="phone-locked" v-model="mfa" :disabled="busy"></b-input>
						</b-field>
						<button class="button w-full is-success" type="submit" :disabled="!ready || busy" :class="{ 'is-loading': busy }">
							Login
						</button>
					</form>
				</div>
			</div>
		</div>
	</section>
</template>
