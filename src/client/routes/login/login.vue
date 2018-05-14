<!--  -->
<script lang="ts" src="./login.ts"></script>

<style>
/**/

section.login-route form {
	max-width: 326px;
}

</style>

<template>
	<section class="login-route">
		<section class="hero is-fullheight">
			<div class="hero-body">
				<div class="container self-start">
					<div class="columns is-mobile justify-center">
						<form class="column is-narrow" v-on:submit.prevent="login()">
							<figure class="image mb-4">
								<img class="is-png robinhood-banner" src="@/assets/robinhood-banner.png">
							</figure>
							<b-field class="mb-2" label="Email or Username">
								<b-input ref="username_input" type="text" icon="account" v-model="username" required :disabled="busy"></b-input>
							</b-field>
							<b-field class="mb-4" label="Password">
								<b-input type="password" icon="lock" v-model="password" password-reveal required :disabled="busy"></b-input>
							</b-field>
							<v-grecaptcha v-if="!ishuman" class="mb-4"></v-grecaptcha>
							<b-field v-show="ismfa" class="mb-4" label="Two-Factor Authentication">
								<b-input ref="mfa_input" type="text" icon="phone-locked" v-model="mfa" :disabled="busy"></b-input>
							</b-field>
							<input class="button w-full is-rhgreen" type="submit" value="Login" :disabled="!ready || busy" :class="{ 'is-loading': busy }">
						</form>
					</div>
				</div>
			</div>
		</section>
	</section>
</template>
