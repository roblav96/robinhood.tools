<!--  -->
<script lang="ts" src="./login.ts"></script>

<style>
/**/

form.robinhood-form .input:not(.is-danger):focus {
    border-color: #21CE99;
    box-shadow: 0 0 0 0.125em rgba(33, 206, 153, 0.25);
}

/**/

</style>

<template>
    <form class="robinhood-login-modal robinhood-form" v-on:submit.prevent="submit()">
        <div class="modal-card" style="width: 342px;">

            <header class="modal-card-head bg-white">
                <img src="@/assets/robinhood-banner.png" class="h-5">
            </header>

            <section class="modal-card-body">
                <b-field label="Email or Username">
                    <b-input id="username_input" type="text" v-model="username" required />
                </b-field>
                <b-field label="Password" class="mb-3">
                    <b-input type="password" v-model="password" required />
                </b-field>
                <v-grecaptcha :gresponse="gresponse" />
            </section>

            <footer class="modal-card-foot">
                <button class="button is-medium is-robinhood-primary w-100 t-bold" type="submit" :disabled="disabled"
                    :class="{ 'is-loading': busy }">
                    Sign In
                </button>
            </footer>

        </div>
    </form>
</template>
