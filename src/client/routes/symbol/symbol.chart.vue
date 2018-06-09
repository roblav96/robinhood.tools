<!--  -->
<script lang="ts" src="./symbol.chart.ts"></script>

<style>
/**/

</style>

<template>
	<div class="flex-col-full">

		<section class="section pb-0">
			<div class="columns items-center">
				<div class="column is-narrow">
					<div class="field has-addons">
						<p class="control">
							<b-tooltip :active="!busy&&!!ranges[rangeindex-1]" :label="vrange(ranges[rangeindex-1])" size="is-small" animated>
								<button class="button" v-on:click="range=ranges[rangeindex-1]" :disabled="busy||!ranges[rangeindex-1]">
									<b-icon icon="chevron-left"></b-icon>
								</button>
							</b-tooltip>
						</p>
						<p class="control">
							<b-dropdown v-model="range" :disabled="busy">
								<button class="button" style="width: 7rem;" :class="{'is-loading':busy}" type="button" slot="trigger">
									<b-icon icon="calendar-range"></b-icon>
									<span>{{vrange(range)}}</span>
								</button>
								<b-dropdown-item class="py-0 is-size-6 font-bold" custom>Date Range</b-dropdown-item>
								<b-dropdown-item separator></b-dropdown-item>
								<b-dropdown-item class="font-medium" v-on:click="range=v" v-for="v in ranges" :value="v" :key="v">
									<span>{{vrange(v)}}</span>
								</b-dropdown-item>
							</b-dropdown>
						</p>
						<p class="control">
							<b-tooltip :active="!busy&&!!ranges[rangeindex+1]" :label="vrange(ranges[rangeindex+1])" size="is-small" animated>
								<button class="button" v-on:click="range=ranges[rangeindex+1]" :disabled="busy||!ranges[rangeindex+1]">
									<b-icon icon="chevron-right"></b-icon>
								</button>
							</b-tooltip>
						</p>
					</div>
				</div>
				<div class="column">
					<!-- <b-field>
						<b-radio-button v-model="range" type="is-primary" v-for="v in ranges" :native-value="v" :key="v">
							<span>{{vrange(v)}}</span>
						</b-radio-button>
					</b-field> -->
				</div>
			</div>
		</section>

		<v-symbol-echart class="flex-col-full" ref="symbol_echart"></v-symbol-echart>



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
	</div>
</template>
