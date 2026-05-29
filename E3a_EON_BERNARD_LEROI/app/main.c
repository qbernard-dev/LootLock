/**
 *******************************************************************************
 * @file 	main.c
 * @author 	jjo
 * @date 	Mar 29, 2024
 * @brief	Fichier principal de votre projet sur carte Nucléo STM32G431KB
 *******************************************************************************
 */

#include "config.h"
#include "stm32g4_sys.h"
#include "stm32g4_systick.h"
#include "stm32g4_gpio.h"
#include "stm32g4_uart.h"
#include "stm32g4_utils.h"
#include "NFC03A1/stm32g4_nfc03a1.h"
#include "NFC03A1/lib_nfc/common/lib_95HFConfigManager.h"
#include "NFC03A1/CR95HF/drv_95HF.h"
#include "TFT_ili9341/stm32g4_ili9341.h"
#include "stm32g4_uart.h"
#include <stdio.h>
#include "stm32g4xx_hal.h"
#define WAIT_DELAY		5000	//ms

typedef enum {
	    SEND_NONE,
	    SEND_KEYBOARD,
	    SEND_NFC
	} SendSource;
	typedef enum
	{
		STATE_INIT=0,
		STATE_WAIT,
		STATE_WAIT_RECEPTION,
		STATE_OPENING,
		STATE_SEND,
		STATE_ERROR
	}state_e;
void state_machine(void);
/**
 * @brief  permet d'allumer ou d'eteindre la led ( pin GPIOA 4)
 *
 * @param b
 */
void write_serrure(bool b)
{
	HAL_GPIO_WritePin(GPIOA, GPIO_PIN_4, b);
}

/**
 * @brief verification de si un character est re�u sur l'uart2
 *
 * @param uart_id
 * @return
 */
bool char_received(uart_id_t uart_id)
{
	if( BSP_UART_data_ready(uart_id) )	/* Si un caractère est reçu sur l'UART 2*/
	{
		BSP_UART_get_next_byte(uart_id);
		return true;
	}
	else
		return false;
}




/**
  * @brief  Point d'entrée de votre application
  */
int main(void)
	{
	/* Cette ligne doit rester la première de votre main !
	 * Elle permet d'initialiser toutes les couches basses des drivers (Hardware Abstraction Layer),
	 * condition préalable indispensable à l'exécution des lignes suivantes.
	 */
	HAL_Init();
	//HC05_set_echo_for_AT_mode();
	/* Initialisation des périphériques utilisés dans votre programme */
	BSP_GPIO_enable();

	/* Indique que les printf sont dirigés vers l'UART2 */
	BSP_SYS_set_std_usart(UART2_ID, UART2_ID, UART2_ID);

	/* Initialisation du port de la led Verte (carte Nucleo) */
	BSP_GPIO_pin_config(LED_GREEN_GPIO, LED_GREEN_PIN, GPIO_MODE_OUTPUT_PP,GPIO_NOPULL,GPIO_SPEED_FREQ_HIGH,GPIO_NO_AF);


	/* Hello student */
	//printf("Hi <Student>, can you read me?\n");
	//BSP_UART_init(UART2_ID,115200);

	//heartbeat();

	//ILI9341_demo();
	/* Tâche de fond, boucle infinie, Infinite loop,... quelque soit son nom vous n'en sortirez jamais */
	//HC05_set_echo_for_AT_mode();
	while (1)
	{
		state_machine();
/*
		if( char_received(UART2_ID) )
		{
			write_LED(true);		/* write_LED? Faites un ctrl+clic dessus pour voir...
			HAL_Delay(BLINK_DELAY);	/* ... ça fonctionne aussi avec les macros, les variables. C'est votre nouveau meilleur ami
			write_LED(false);
		}*/
		//BSP_NFC03A1_demo();
		//BSP_MATRIX_KEYBOARD_demo_process_main();

	}
}
/**
 * @brief machine � �tat g�rant le fonctionnement du projet
 *
 */
void state_machine(void)
{
	uint8_t trame[256];
	uint8_t contenu[32];
	uint8_t taille;
	ISO14443A_CARD infos;
	static SendSource send_type=SEND_NONE;



	static state_e state = STATE_INIT;
	static state_e previous_state = STATE_INIT;

	bool entry = (state!=previous_state)?true:false;
	previous_state = state;

	static char buffer[5] = {0};
	static int digit_count = 0;
	static char message[50];
	// Récupération des évènements


	switch(state)
	{
		case STATE_INIT:{

		    const char *new_keyboard_keys = NULL;
		    ILI9341_Init();
		    ILI9341_Rotate(ILI9341_Orientation_Landscape_2);
		    ILI9341_Fill(ILI9341_COLOR_WHITE);


			BSP_UART_init(UART2_ID,115200);
			//initialisation pin serrure
			BSP_GPIO_pin_config(GPIOA, GPIO_PIN_4, GPIO_MODE_OUTPUT_PP,GPIO_NOPULL,GPIO_SPEED_FREQ_HIGH,GPIO_NO_AF);

			state = STATE_WAIT;
			break;
		}
		case STATE_WAIT:{
			if (entry){
				write_serrure(false);
				ILI9341_Fill(ILI9341_COLOR_WHITE);
				ILI9341_Puts(25,200, "attente", &Font_7x10, ILI9341_COLOR_BROWN, ILI9341_COLOR_WHITE);
				write_serrure(false);
				BSP_NFC03A1_Init(PCD);


			}
		    char c = BSP_MATRIX_KEYBOARD_process_main();

			if (c != '\0'){
				if (c >= '0' && c <= '9') {
					for(int i = 0; i < 4; i++) {
						buffer[i] = buffer[i+1];
					}
					buffer[4] = c;
					digit_count++;
				}
				else if (c == '#') {
					if (digit_count >= 4) {
						state = STATE_SEND;
						send_type=SEND_KEYBOARD;
					}
					digit_count = 0;
				}
				else {
					digit_count = 0;
				}
			}


			if(BSP_NFC03A1_read(&infos))
			{
			   state=STATE_SEND;
			   send_type=SEND_NFC;
			}


			break;
		}
		case STATE_SEND:{
			if(send_type==SEND_NONE){
				state=STATE_ERROR;
				strcpy(message,"send_type==SEND_NONE");
			}
			if(send_type == SEND_KEYBOARD){
				memcpy(contenu, &buffer[1], 4);
				taille = 4;
			}

			if(send_type == SEND_NFC){
				for(int i=0; i<infos.UIDsize; i++)
				    {
					contenu[i] = infos.UID[i];
				    }

				    taille = infos.UIDsize;
			}
			uint8_t index = 0;

			trame[index++] = 0xBA;
			trame[index++] = taille;

			if (send_type == SEND_NFC){
				trame[index++] = 0x01;
			}else{
				trame[index++] = 0x00;
			}

			for(int i=0; i<taille; i++)
			{
				trame[index++] = contenu[i];
			}

			trame[index++] = 0xFA;

			BSP_UART_puts(UART2_ID, trame, index);
			state = STATE_WAIT_RECEPTION;
			break;
		}
		case STATE_WAIT_RECEPTION:
		{
			if (entry){


				ILI9341_Puts(25,200, "attente retour ble ", &Font_7x10, ILI9341_COLOR_BROWN, ILI9341_COLOR_WHITE);
				write_serrure(false);

			}
			uint8_t rx[64];

			    int len = BSP_UART_gets(UART2_ID, rx, 64);
			    if(len!=0){

			    if(len < 4){
			        state = STATE_ERROR;
			        strcpy(message, "trame trop courte");
			        break;
			    }

			    if(rx[0] != 0xBA){
			        state = STATE_ERROR;
			        strcpy(message, "pas BA ");
			        break;
			    }

			    if(rx[len - 1] != 0xFA){
			        state = STATE_ERROR;
			        strcpy(message, "pas FA ");
			        break;
			    }

			    uint8_t taille = rx[1];
			    uint8_t code   = rx[2];



			    switch(code)
			    {
			        case 0x00:
			        {
			            uint8_t tailleNom = taille - 1;

			            memset(message, 0, sizeof(message));

			            for(int i = 0; i < tailleNom; i++){
			                message[i] = rx[3 + i];
			            }

			            state = STATE_OPENING;
			            break;
			        }

			        case 0x01:
			        {
			            strcpy(message, "Acces refuse");
			            state = STATE_ERROR;
			            break;
			        }

			        case 0x02:
			        {
			            uint8_t tailleErreur = taille - 1;

			            memset(message, 0, sizeof(message));

			            for(int i = 0; i < tailleErreur; i++){
			                message[i] = rx[3 + i];
			            }

			            state = STATE_ERROR;
			            break;
			        }

			        default:
			        {
			            strcpy(message, "code inconnu, pas 0x00 ou 0x01 ou 0x02");
			            state = STATE_ERROR;
			            break;
			        }
			    }

			    }
			break;
		}
		case STATE_OPENING:
		{
			if (entry){

				write_serrure(true);
				ILI9341_Fill(ILI9341_COLOR_WHITE);
				ILI9341_Puts(25,200, "ouvert", &Font_7x10, ILI9341_COLOR_BROWN, ILI9341_COLOR_WHITE);
			}

			HAL_Delay(WAIT_DELAY);
			state=STATE_WAIT;


			break;
		}
		case STATE_ERROR:
		{
			if (entry){

				ILI9341_Fill(ILI9341_COLOR_WHITE);
				ILI9341_Puts(25,200, "erreur ", &Font_7x10, ILI9341_COLOR_BROWN, ILI9341_COLOR_WHITE);
				write_serrure(false);

			}
			HAL_Delay(WAIT_DELAY);
			state=STATE_WAIT;

			break;
		}
        default:
        {
        	break;
        }
	}

}
