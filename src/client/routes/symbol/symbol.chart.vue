<!--  -->
<script lang="ts" src="./symbol.chart.ts"></script>

<style>
/**/

</style>

<template>
	<section class="flex-col-full pb-4">

		<v-symbol-echart class="flex-col-full" ref="symbol_echart"></v-symbol-echart>

		<div class="columns items-center">

			<div class="column">
				<b-field>
					<b-radio-button v-model="range" type="is-primary" v-for="v in ranges" :native-value="v" :key="v">
						<span>{{vrange(v)}}</span>
					</b-radio-button>
				</b-field>
			</div>

		</div>



		<!-- <div class="column pb-0 is-narrow">
			<div class="field has-addons">
				<p class="control">
					<b-dropdown v-model="range" :disabled="busy" :hoverable="rangehover">
						<button class="button is-primary" :class="{'is-loading':busy}" type="button" slot="trigger">
							<b-icon icon="calendar-range"></b-icon>
							<span>Historicals</span>
						</button>
						<b-dropdown-item class="py-0 is-size-6 font-bold" custom>Date Range</b-dropdown-item>
						<b-dropdown-item separator></b-dropdown-item>
						<b-dropdown-item class="font-medium" v-on:click="onrange" v-for="v in ranges" :value="v" :key="v">
							<span>{{vrange(v)}}</span>
						</b-dropdown-item>
					</b-dropdown>
				</p>
				<p class="control">
					<a class="button">
						<span class="icon is-small">
							<i class="fas fa-align-right"></i>
						</span>
						<span>Right</span>
					</a>
				</p>
			</div>
		</div> -->

		<!-- <div class="column"> -->
		<!-- <div class="column">
					<b-dropdown v-model="range" hoverable position="is-top-right">
						<button class="button is-large is-primary" type="button" slot="trigger">
							<b-icon icon="calendar-range"></b-icon>
							<span>{{vstcase(range)}}</span>
						</button>
						<b-dropdown-item v-for="v in ranges" :value="v">
							<span>{{vstcase(v)}}</span>
						</b-dropdown-item>
					</b-dropdown>
				</div> -->



		<!-- </div> -->
	</section>
</template>
